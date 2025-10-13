const { Property } = require('../config/sqliteConfig');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class PropertyController {
  // GET /api/properties
  static async getAllProperties(req, res) {
    try {
      const { location, type, status, minPrice, maxPrice } = req.query;
      
      // Build where clause for filtering
      const whereClause = {};
      
      if (location) {
        whereClause.location = {
          [Op.like]: `%${location}%`
        };
      }
      
      if (type) {
        whereClause.type = type;
      }
      
      if (status) {
        whereClause.status = status;
      }
      
      if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) {
          whereClause.price[Op.gte] = parseInt(minPrice);
        }
        if (maxPrice) {
          whereClause.price[Op.lte] = parseInt(maxPrice);
        }
      }

      const properties = await Property.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: properties,
        count: properties.length
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/properties/:id
  static async getPropertyById(req, res) {
    try {
      const { id } = req.params;
      const property = await Property.findByPk(id);

      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }

      res.json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/properties
  static async createProperty(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const property = await Property.create(req.body);
      
      res.status(201).json({
        success: true,
        data: property,
        message: 'Property created successfully'
      });
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/properties/:id
  static async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const [updatedRowsCount] = await Property.update(req.body, {
        where: { id: id }
      });

      if (updatedRowsCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }

      const property = await Property.findByPk(id);
      
      res.json({
        success: true,
        data: property,
        message: 'Property updated successfully'
      });
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // DELETE /api/properties/:id
  static async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      
      const deletedRowsCount = await Property.destroy({
        where: { id: id }
      });

      if (deletedRowsCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Property deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = PropertyController;
