// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ── POST /auth/google — Google OAuth (mobile)
router.post('/google', authController.googleLogin);

// ── POST /auth/login — mock login (dev)
router.post('/login', authController.login);

// ── GET /auth/me — return current session/JWT user
router.get('/me', authController.getMe);

// ── POST /auth/logout
router.post('/logout', authController.logout);

module.exports = router;