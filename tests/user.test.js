process.env.SUPABASE_URL = 'https://njlobioqgdedrmleslat.supabase.co';
process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbG9iaW9xZ2RlZHJtbGVzbGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDYyODEsImV4cCI6MjA5NjU4MjI4MX0.-YcKL-WiNNnG9xg7VwNtEC1HtrYHq0SuTd3g-WkXxzY';
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '1h';

const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

jest.mock('../config/supabase', () => require('./mockSupabase'));
const mockSupabase = require('../config/supabase');

const generateToken = (userId = 'user-uuid', email = 'user@example.com') => {
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('User Profile Endpoints (Routes Protected under Login)', () => {
  let validToken;

  beforeAll(() => {
    validToken = generateToken();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.data = null;
    mockSupabase.error = null;
    mockSupabase.then.mockImplementation(function (onFulfilled) {
      onFulfilled({ data: this.data, error: this.error });
    });
  });

  describe('Route Protection Check', () => {
    it('should deny access to GET /profile/all without token', async () => {
      const res = await request(app).get('/profile/all');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('should deny access to GET /profile/all with invalid token', async () => {
      const res = await request(app)
        .get('/profile/all')
        .set('Authorization', 'Bearer invalid_token');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or expired token');
    });
  });

  describe('GET /profile/all', () => {
    it('should return all users when authorized', async () => {
      const mockUsers = [
        { id: '1', name: 'Alice', email: 'alice@example.com' },
        { id: '2', name: 'Bob', email: 'bob@example.com' },
      ];
      mockSupabase.data = mockUsers;
      mockSupabase.error = null;

      const res = await request(app)
        .get('/profile/all')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toEqual(mockUsers);
    });

    it('should return 500 if database fetch fails', async () => {
      mockSupabase.data = null;
      mockSupabase.error = { message: 'Database fetch error' };

      const res = await request(app)
        .get('/profile/all')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database fetch error');
    });
  });

  describe('POST /profile/all', () => {
    it('should create a user when authorized', async () => {
      const newUser = { name: 'Charlie', email: 'charlie@example.com', role: 'User' };
      const createdUser = { id: 'charlie-uuid', ...newUser };
      mockSupabase.data = createdUser;
      mockSupabase.error = null;

      const res = await request(app)
        .post('/profile/all')
        .set('Authorization', `Bearer ${validToken}`)
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(createdUser);
    });
  });

  describe('GET /profile/:id', () => {
    it('should get user details by id', async () => {
      const user = { id: 'some-id', name: 'Alice', email: 'alice@example.com' };
      mockSupabase.data = user;
      mockSupabase.error = null;

      const res = await request(app)
        .get('/profile/some-id')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(user);
    });

    it('should return 404 if user not found', async () => {
      mockSupabase.data = null;
      mockSupabase.error = { message: 'User not found' };

      const res = await request(app)
        .get('/profile/nonexistent-id')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });
  });

  describe('PUT /profile/:id', () => {
    it('should update user profile details', async () => {
      const updatedUser = { id: 'some-id', name: 'Alice Updated', email: 'alice@example.com' };
      mockSupabase.data = updatedUser;
      mockSupabase.error = null;

      const res = await request(app)
        .put('/profile/some-id')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Alice Updated' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(updatedUser);
    });
  });

  describe('DELETE /profile/:id', () => {
    it('should delete user profile by id', async () => {
      mockSupabase.error = null;

      const res = await request(app)
        .delete('/profile/some-id')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User deleted');
    });
  });
});
