export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied: Administrator privileges required for this action.',
    });
  }
  next();
};
