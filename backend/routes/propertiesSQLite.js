const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/propertyControllerSQLite');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { propertyValidation } = require('../middleware/validation');

// Public routes
router.get('/', PropertyController.getAllProperties);
router.get('/:id', PropertyController.getPropertyById);

// Protected routes (require authentication)
router.use(authenticateToken);

// Admin only routes
router.post('/', requireAdmin, propertyValidation, PropertyController.createProperty);
router.put('/:id', requireAdmin, propertyValidation, PropertyController.updateProperty);
router.delete('/:id', requireAdmin, PropertyController.deleteProperty);

module.exports = router;
