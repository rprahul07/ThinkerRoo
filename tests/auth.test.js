process.env.SUPABASE_URL = 'https://njlobioqgdedrmleslat.supabase.co';
process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbG9iaW9xZ2RlZHJtbGVzbGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDYyODEsImV4cCI6MjA5NjU4MjI4MX0.-YcKL-WiNNnG9xg7VwNtEC1HtrYHq0SuTd3g-WkXxzY';
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '1h';

const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');

jest.mock('../config/supabase', () => require('./mockSupabase'));
const mockSupabase = require('../config/supabase');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.data = null;
    mockSupabase.error = null;
    mockSupabase.then.mockImplementation(function (onFulfilled) {
      onFulfilled({ data: this.data, error: this.error });
    });
  });

  describe('POST /auth/register', () => {
    it('should fail if name, email, or password is missing', async () => {
      const res1 = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res1.status).toBe(400);
      expect(res1.body.success).toBe(false);
      expect(res1.body.message).toContain('required');

      const res2 = await request(app)
        .post('/auth/register')
        .send({ name: 'Jane Doe', password: 'password123' });
      expect(res2.status).toBe(400);
      expect(res2.body.success).toBe(false);
      expect(res2.body.message).toContain('required');

      const res3 = await request(app)
        .post('/auth/register')
        .send({ name: 'Jane Doe', email: 'test@example.com' });
      expect(res3.status).toBe(400);
      expect(res3.body.success).toBe(false);
      expect(res3.body.message).toContain('required');
    });

    it('should fail if password is less than 6 characters', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Jane Doe', email: 'test@example.com', password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 6 characters');
    });

    it('should fail if email already exists', async () => {
      // Mock existing user check: returns a single record
      mockSupabase.data = { id: 'existing-id' };
      mockSupabase.error = null;

      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Jane Doe', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already registered');
    });

    it('should register successfully', async () => {
      // Mock existing check to return null (no user found)
      let isFirstCall = true;
      mockSupabase.then.mockImplementation(function (onFulfilled) {
        if (isFirstCall) {
          isFirstCall = false;
          onFulfilled({ data: null, error: null }); // check existing user returns null
        } else {
          onFulfilled({
            data: { id: 'new-uuid', name: 'Jane Doe', email: 'test@example.com', created_at: '2026-06-19T00:00:00Z' },
            error: null
          }); // insert returns user
        }
      });

      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Jane Doe', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.id).toBe('new-uuid');
      expect(res.body.user.name).toBe('Jane Doe');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should fail if database insert fails', async () => {
      let isFirstCall = true;
      mockSupabase.then.mockImplementation(function (onFulfilled) {
        if (isFirstCall) {
          isFirstCall = false;
          onFulfilled({ data: null, error: null }); // check existing user returns null
        } else {
          onFulfilled({
            data: null,
            error: { message: 'Database insert failed' }
          }); // insert fails
        }
      });

      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Jane Doe', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database insert failed');
    });
  });

  describe('POST /auth/login', () => {
    it('should fail if email or password is missing', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should fail with invalid email', async () => {
      mockSupabase.data = null;
      mockSupabase.error = null;

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should fail with incorrect password', async () => {
      const hash = await bcrypt.hash('correct_password', 10);
      mockSupabase.data = { id: 'user-id', email: 'test@example.com', password_hash: hash };
      mockSupabase.error = null;

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong_password' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should login successfully', async () => {
      const hash = await bcrypt.hash('correct_password', 10);
      mockSupabase.data = { id: 'user-id', email: 'test@example.com', password_hash: hash, created_at: '2026-06-19T00:00:00Z' };
      mockSupabase.error = null;

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'correct_password' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.password_hash).toBeUndefined();
      expect(res.body.user.id).toBe('user-id');
      expect(res.body.user.email).toBe('test@example.com');
    });
  });
});
