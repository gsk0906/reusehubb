import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloud SSL configuration
const buildSslConfig = () => {
  if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
    if (process.env.DB_SSL_CA) {
      return {
        ca: process.env.DB_SSL_CA,
        rejectUnauthorized: true,
      };
    }
    // Standard cloud MySQL (Aiven, Railway, TiDB, PlanetScale)
    return {
      rejectUnauthorized: false,
    };
  }
  return undefined;
};

// Create MySQL connection pool using mysql2/promise
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'reusehub_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  ssl: buildSslConfig(),
});

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log(`[DB] Connected successfully to MySQL (${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306})`);
    return true;
  } catch (error) {
    console.warn(`[DB WARNING] Could not connect to MySQL database: ${error.message}`);
    console.warn(`[DB WARNING] Check your DB_* credentials in .env. The server will run, but DB queries will fail until connected.`);
    return false;
  }
};

// Auto-initialize schema & seed admin account if requested or on first run
export const initDatabase = async () => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) return;

    // Check if users table exists
    const [rows] = await pool.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME || 'reusehub_db']);

    if (rows.length === 0) {
      console.log('[DB] Initializing database tables from schema.sql...');
      const schemaPath = path.join(__dirname, '../schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        // Split by semicolon, filter out USE and CREATE DATABASE statements to avoid privilege errors
        const statements = schemaSql
          .split(/;\s*$/m)
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE'));

        for (const stmt of statements) {
          await pool.query(stmt);
        }
        console.log('[DB] Schema created successfully.');

        // Optionally seed sample data if seed.sql exists
        const seedPath = path.join(__dirname, '../seed.sql');
        if (fs.existsSync(seedPath)) {
          const seedSql = fs.readFileSync(seedPath, 'utf8');
          const seedStatements = seedSql
            .split(/;\s*$/m)
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.toUpperCase().startsWith('USE'));
          for (const sStmt of seedStatements) {
            try {
              await pool.query(sStmt);
            } catch (_err) {
              // Non-blocking duplicate seed catch
            }
          }
          console.log('[DB] Seed data populated successfully.');
        }
      }
    }

    // Seed or ensure Admin user exists from env vars
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@reusehub.edu.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    const [existingAdmin] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail.toLowerCase().trim()]
    );

    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        `INSERT INTO users (name, email, department, hostel, phone, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['System Administrator', adminEmail.toLowerCase().trim(), 'Administration', 'Campus HQ', '+91 99999 00000', passwordHash, 'admin']
      );
      console.log(`[DB] Default admin user initialized: ${adminEmail}`);
    }
  } catch (error) {
    console.warn(`[DB] Database auto-init error: ${error.message}`);
  }
};

export default pool;
