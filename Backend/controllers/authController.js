// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'civicalert_jwt_secret_dev';
const JWT_EXPIRES = '7d';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// ── POST /auth/google — Google OAuth for mobile ───────────────────────────────
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Google idToken is required.' });
    }

    let payload;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    if (GOOGLE_CLIENT_ID) {
      // Verify with Google
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      // Mock fallback — decode without verification (dev only)
      console.log('⚠ GOOGLE_CLIENT_ID not set — using mock Google auth');
      const parts = idToken.split('.');
      if (parts.length === 3) {
        try {
          payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        } catch {
          payload = null;
        }
      }
      if (!payload || !payload.email) {
        // Generate mock payload for dev
        payload = {
          sub: 'mock_' + Date.now(),
          email: 'user@demo.com',
          name: 'Demo User',
          picture: null,
        };
      }
    }

    // Upsert user
    let user = await User.findOne({ where: { email: payload.email } });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        name: payload.name || 'User',
        email: payload.email,
        avatar: payload.picture || null,
        role: 'user',
        points: 0,
      });
    } else if (!user.googleId) {
      await user.update({ googleId: payload.sub, avatar: payload.picture || user.avatar });
    }

    const token = signToken(user);
    const { id, name, email, avatar, role, points } = user;

    res.json({
      success: true,
      token,
      user: { id, name, email, avatar, role, points },
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ error: 'Google authentication failed.' });
  }
};

// ── POST /auth/login — mock login with email + password ───────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Session for web
    req.session.userId = user.id;

    // Also return JWT for mobile clients
    const token = signToken(user);
    const { id, name, email: userEmail, avatar, role, points } = user;

    res.json({
      success: true,
      token,
      user: { id, name, email: userEmail, avatar, role, points },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
};

// ── GET /auth/me — return current user (session OR JWT) ───────────────────────
exports.getMe = async (req, res) => {
  try {
    // Try JWT first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (user) {
          const { id, name, email, avatar, role, points } = user;
          return res.json({ id, name, email, avatar, role, points });
        }
      } catch {}
    }

    // Fall back to session
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found.' });
    }

    const { id, name, email, avatar, role, points } = user;
    res.json({ id, name, email, avatar, role, points });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

// ── POST /auth/logout ─────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed.' });
    res.json({ success: true, message: 'Logged out.' });
  });
};