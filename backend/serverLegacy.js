const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT_LEGACY || 3003;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple file-based property storage
const fs = require('fs');
const propertiesFile = path.join(__dirname, 'data/properties.json');

// Helper functions
const readProperties = () => {
  try {
    const data = fs.readFileSync(propertiesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeProperties = (properties) => {
  fs.writeFileSync(propertiesFile, JSON.stringify(properties, null, 2));
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ADAProperty Backend API is running with File-based JSON',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/properties', (req, res) => {
  try {
    const properties = readProperties();
    res.json({
      success: true,
      data: properties,
      count: properties.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/properties/:id', (req, res) => {
  try {
    const properties = readProperties();
    const property = properties.find(p => p.id === req.params.id);
    
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
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple auth for demo
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    const token = 'demo-token-' + Date.now();
    res.json({
      success: true,
      data: {
        user: { id: '1', username: 'admin', role: 'admin' },
        token: token
      },
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    data: {
      user: { id: '1', username: 'admin', role: 'admin' }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Legacy Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🗄️  Database: File-based JSON`);
  console.log(`📁 Data file: ${propertiesFile}`);
});
