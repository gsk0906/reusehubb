import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'reusehub_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '7d';

// Generate standard JWT token
const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Format user payload ensuring both `id` and `_id` are provided without `password_hash`
export const formatUserPayload = (user) => {
  return {
    id: user.id,
    _id: String(user.id),
    name: user.name,
    email: user.email,
    department: user.department || user.hostel || 'Campus Member',
    hostel: user.hostel || user.department || 'Campus Member',
    phone: user.phone || '',
    role: user.role || 'user',
    created_at: user.created_at,
    last_login_at: user.last_login_at,
  };
};

/**
 * Register a new student account
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, department, hostel, phone } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A student with this email address is already registered.' });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const userDept = (department || hostel || 'Campus Member').trim();
    const userHostel = (hostel || department || 'Campus Member').trim();
    const userPhone = (phone || '').trim();

    const [result] = await pool.query(
      `INSERT INTO users (name, email, department, hostel, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?, 'user')`,
      [name.trim(), normalizedEmail, userDept, userHostel, userPhone, passwordHash]
    );

    const newUserId = result.insertId;

    // Fetch newly created user record
    const [rows] = await pool.query(
      'SELECT id, name, email, department, hostel, phone, role, created_at, last_login_at FROM users WHERE id = ?',
      [newUserId]
    );

    const newUser = rows[0];
    const token = signToken(newUser);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: formatUserPayload(newUser),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate student login
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = (email || '').toLowerCase().trim();

    // Query user including password_hash for validation
    const [users] = await pool.query(
      'SELECT id, name, email, department, hostel, phone, password_hash, role, created_at, last_login_at FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password. Please verify your credentials.' });
    }

    const user = users[0];

    // Verify bcrypt password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password. Please verify your credentials.' });
    }

    // Update last_login_at on successful login
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    // Insert row into login_logs table
    const ipAddress = (
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    ).toString().split(',')[0].trim();

    const userAgent = (req.headers['user-agent'] || 'Unknown Device').toString();

    await pool.query(
      'INSERT INTO login_logs (user_id, login_time, ip_address, user_agent) VALUES (?, NOW(), ?, ?)',
      [user.id, ipAddress, userAgent]
    );

    // Refresh last_login_at in response
    user.last_login_at = new Date().toISOString();

    const token = signToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: formatUserPayload(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user profile
 * GET /api/auth/me (or /api/users/me)
 */
export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      user: formatUserPayload(req.user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 * PUT /api/auth/me (or /api/users/me)
 */
export const updateMe = async (req, res, next) => {
  try {
    const { name, department, hostel, phone } = req.body;
    const userId = req.user.id;

    const updates = [];
    const values = [];

    if (name && name.trim()) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (department && department.trim()) {
      updates.push('department = ?');
      values.push(department.trim());
      updates.push('hostel = ?');
      values.push(department.trim());
    } else if (hostel && hostel.trim()) {
      updates.push('hostel = ?');
      values.push(hostel.trim());
      updates.push('department = ?');
      values.push(hostel.trim());
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone.trim());
    }

    if (updates.length > 0) {
      values.push(userId);
      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, department, hostel, phone, role, created_at, last_login_at FROM users WHERE id = ?',
      [userId]
    );

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: formatUserPayload(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};
