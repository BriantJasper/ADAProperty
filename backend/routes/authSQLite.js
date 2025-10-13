const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authControllerSQLite');
const { loginValidation } = require('../middleware/validation');

// Routes
router.post('/login', loginValidation, AuthController.login);
router.post('/verify', AuthController.verifyToken);
router.post('/register', AuthController.register); // Bonus: registration endpoint
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
