import pool from '../config/db.js';

export const getHealth = async (req, res) => {
  let dbStatus = {
    connected: false,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'reusehub_db',
  };

  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    dbStatus.connected = true;
  } catch (err) {
    dbStatus.connected = false;
    dbStatus.error = err.message;
  }

  const statusCode = dbStatus.connected ? 200 : 503;

  return res.status(statusCode).json({
    status: dbStatus.connected ? 'healthy' : 'degraded',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
  });
};
