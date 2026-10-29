import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { initDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import itemsRoutes from './routes/itemsRoutes.js';
import requestsRoutes from './routes/requestsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Accessible from any phone or laptop on network

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// -----------------------------------------------------------------------------
// Security & Utility Middlewares
// -----------------------------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allows cross-origin image embedding
    crossOriginEmbedderPolicy: false,
  })
);

// Morgan HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS Configuration
const allowedClientUrl = process.env.CLIENT_URL;
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // If specific CLIENT_URL configured, allow it
      if (allowedClientUrl && allowedClientUrl !== '*') {
        const allowedOrigins = allowedClientUrl.split(',').map((u) => u.trim());
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
      }

      // In development or local network testing, allow localhost and private network IPs
      if (
        process.env.NODE_ENV !== 'production' ||
        !allowedClientUrl ||
        allowedClientUrl === '*' ||
        /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(
          origin
        )
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting (100 reqs per 15 min for general API; relaxed in dev)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 150 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/', apiLimiter);

// Specific Auth Limiter for brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 200,
  message: { message: 'Too many login attempts. Please wait 15 minutes before trying again.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(uploadsDir));

// -----------------------------------------------------------------------------
// REST API Routes
// -----------------------------------------------------------------------------
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// -----------------------------------------------------------------------------
// Production: Serve React frontend built static files
// -----------------------------------------------------------------------------
const distDir = path.join(__dirname, '../dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir));

  // Catch-all route for Single Page Application client-side routing
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
      const indexHtmlPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtmlPath)) {
        return res.sendFile(indexHtmlPath);
      }
    }
    next();
  });
}

// -----------------------------------------------------------------------------
// Centralized Error Handling
// -----------------------------------------------------------------------------
app.use(errorHandler);

// -----------------------------------------------------------------------------
// Server Initialization
// -----------------------------------------------------------------------------
const startServer = async () => {
  // Test connection and auto-initialize DB schema & admin seed
  await initDatabase();

  app.listen(PORT, HOST, () => {
    console.log(`=======================================================`);
    console.log(`  ReUseHub Production Backend Live!`);
    console.log(`  Local:   http://localhost:${PORT}`);
    console.log(`  Network: http://0.0.0.0:${PORT} (any device on Wi-Fi)`);
    console.log(`  Mode:    ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
};

startServer().catch((err) => {
  console.error('[FATAL SERVER START ERROR]', err);
  process.exit(1);
});

export default app;
