// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'civicalert_jwt_secret_dev';

// Ensure user is logged in (JWT or session)
async function requireAuth(req, res, next) {
  try {
    // Try JWT first (mobile clients)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (user) {
          req.user = user;
          return next();
        }
      } catch (jwtErr) {
        // JWT invalid — fall through to session
      }
    }

    // Fall back to session (web clients)
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authentication check failed.' });
  }
}

// Ensure user has admin role
async function requireAdmin(req, res, next) {
  try {
    // Try JWT first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (user && user.role === 'admin') {
          req.user = user;
          return next();
        }
        if (user && user.role !== 'admin') {
          return res.status(403).json({ error: 'Admin access required.' });
        }
      } catch {}
    }

    // Fall back to session
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authorization check failed.' });
  }
}

module.exports = { requireAuth, requireAdmin };