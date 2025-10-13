const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const AuthController = require('../controllers/authControllerSQLite');

// Admin-only route to change credentials
router.post('/change-credentials', authenticateToken, requireAdmin, AuthController.changeCredentials);

module.exports = router;