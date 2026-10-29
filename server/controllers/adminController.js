import pool from '../config/db.js';

/**
 * List all registered users with search and pagination
 * GET /api/admin/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10', 10)));
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim().toLowerCase();

    const whereClauses = [];
    const params = [];

    if (search) {
      whereClauses.push('(LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.department) LIKE ? OR u.phone LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count query
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u ${whereSql}`,
      params
    );
    const totalUsers = countRows[0].total;
    const totalPages = Math.ceil(totalUsers / limit);

    // Data query with listing counts
    const query = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.department,
        u.hostel,
        u.phone,
        u.role,
        u.created_at,
        u.last_login_at,
        COUNT(i.id) AS total_listings
      FROM users u
      LEFT JOIN items i ON u.id = i.seller_id
      ${whereSql}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [users] = await pool.query(query, [...params, limit, offset]);

    return res.status(200).json({
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages,
      },
      users: users.map((u) => ({
        id: u.id,
        _id: String(u.id),
        name: u.name,
        email: u.email,
        department: u.department,
        hostel: u.hostel,
        phone: u.phone,
        role: u.role,
        totalListings: Number(u.total_listings || 0),
        createdAt: u.created_at,
        lastLoginAt: u.last_login_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user profile with their listings and login history
 * GET /api/admin/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch user (never select password_hash)
    const [users] = await pool.query(
      'SELECT id, name, email, department, hostel, phone, role, created_at, last_login_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];

    // 2. Fetch user's listings
    const [items] = await pool.query(
      'SELECT id, title, category, price, condition_type, status, is_sold, image_url, created_at FROM items WHERE seller_id = ? ORDER BY created_at DESC',
      [id]
    );

    // 3. Fetch user's recent login activity
    const [loginLogs] = await pool.query(
      'SELECT id, login_time, ip_address, user_agent FROM login_logs WHERE user_id = ? ORDER BY login_time DESC LIMIT 20',
      [id]
    );

    return res.status(200).json({
      user: {
        id: user.id,
        _id: String(user.id),
        name: user.name,
        email: user.email,
        department: user.department,
        hostel: user.hostel,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
      items: items.map((i) => ({
        id: i.id,
        _id: String(i.id),
        title: i.title,
        category: i.category,
        price: Number(i.price),
        condition: i.condition_type,
        status: i.status,
        isSold: Boolean(i.is_sold),
        imageUrl: i.image_url,
        createdAt: i.created_at,
      })),
      loginHistory: loginLogs.map((l) => ({
        id: l.id,
        loginTime: l.login_time,
        ipAddress: l.ip_address,
        userAgent: l.user_agent,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get platform-wide recent login activity
 * GET /api/admin/login-activity
 */
export const getLoginActivity = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM login_logs');
    const totalLogs = countRows[0].total;
    const totalPages = Math.ceil(totalLogs / limit);

    const query = `
      SELECT
        l.id,
        l.login_time,
        l.ip_address,
        l.user_agent,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role
      FROM login_logs l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.login_time DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [limit, offset]);

    return res.status(200).json({
      pagination: {
        page,
        limit,
        total: totalLogs,
        totalPages,
      },
      logs: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name,
        userEmail: r.user_email,
        userRole: r.user_role,
        loginTime: r.login_time,
        ipAddress: r.ip_address,
        userAgent: r.user_agent,
      })),
    });
  } catch (error) {
    next(error);
  }
};
