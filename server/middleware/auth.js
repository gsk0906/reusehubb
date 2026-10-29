import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No Bearer token provided.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Token is empty.' });
    }

    const secret = process.env.JWT_SECRET || 'reusehub_super_secret_jwt_key_2026';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (_jwtErr) {
      return res.status(401).json({ message: 'Session expired or token invalid. Please log in again.' });
    }

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Malformed authentication token.' });
    }

    // Query active user from DB (parameterized query)
    const [rows] = await pool.query(
      'SELECT id, name, email, department, hostel, phone, role, created_at, last_login_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User account not found or deactivated.' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    next(error);
  }
};
