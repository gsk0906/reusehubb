import multer from 'multer';

export const errorHandler = (err, req, res, _next) => {
  console.error(`[SERVER ERROR] ${req.method} ${req.url}:`, err);

  // Multer error handling
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum allowed size is 5MB.',
      });
    }
    return res.status(400).json({
      message: `File upload error: ${err.message}`,
    });
  }

  // Custom client validation error
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      message: err.message,
    });
  }

  // MySQL Duplicate Key Error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'A record with these details already exists (e.g. duplicate email).',
    });
  }

  // MySQL Connection / Server Error
  if (err.code && (err.code.startsWith('ER_') || err.code.startsWith('ECONN'))) {
    return res.status(503).json({
      message: 'Database service temporarily unavailable. Please verify MySQL configuration.',
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.friendlyMessage || err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
