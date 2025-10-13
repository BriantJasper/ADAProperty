const { body, validationResult } = require('express-validator');

// Property validation rules
const propertyValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  // Description is optional
  
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isInt({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('location')
    .notEmpty()
    .withMessage('Location is required'),
  
  body('subLocation')
    .notEmpty()
    .withMessage('Sub location is required'),
  
  body('type')
    .isIn(['rumah', 'apartemen', 'tanah', 'ruko'])
    .withMessage('Type must be one of: rumah, apartemen, tanah, ruko'),
  
  body('status')
    .isIn(['dijual', 'disewa'])
    .withMessage('Status must be one of: dijual, disewa'),
  
  body('bedrooms')
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),
  
  body('bathrooms')
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),
  
  body('area')
    .isInt({ min: 0 })
    .withMessage('Area must be a non-negative integer'),
  
  body('whatsappNumber')
    .notEmpty()
    .withMessage('WhatsApp number is required')
];

// Login validation rules
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

module.exports = {
  propertyValidation,
  loginValidation
};
