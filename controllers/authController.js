const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

const SALT_ROUNDS = 10;
const TABLE = 'users';

/**
 * POST /auth/register
 * Body: { email, password }
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from(TABLE)
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ name, email, password_hash })
    .select('id, name, email, created_at')
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  // Issue JWT
  const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return res.status(201).json({ success: true, token, user: data });
};

/**
 * POST /auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  // Fetch user by email
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, email, password_hash, created_at')
    .eq('email', email)
    .maybeSingle();

  if (error || !data) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  // Compare password
  const isValid = await bcrypt.compare(password, data.password_hash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  // Issue JWT
  const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const { password_hash, ...user } = data; // strip hash from response
  return res.status(200).json({ success: true, token, user });
};

module.exports = { register, login };
