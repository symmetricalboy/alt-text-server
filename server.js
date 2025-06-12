// Load environment variables from .env file
require('dotenv').config();

// Express server wrapper for Railway deployment
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import the cloud function logic
const { generateAltTextProxy } = require('./index.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'alt-text-server' });
});

// Main endpoint - convert the Google Cloud Function handler
app.post('/generate-alt-text', async (req, res) => {
  try {
    // Create a mock request/response object compatible with the cloud function
    const mockReq = {
      method: req.method,
      headers: req.headers,
      body: req.body
    };
    
    const mockRes = {
      statusCode: 200,
      headers: {},
      body: null,
      set: (key, value) => {
        mockRes.headers[key] = value;
      },
      status: (code) => {
        mockRes.statusCode = code;
        return mockRes;
      },
      send: (data) => {
        mockRes.body = data;
        // Actually send the response
        res.status(mockRes.statusCode);
        Object.entries(mockRes.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.send(data);
      },
      json: (data) => {
        mockRes.body = data;
        // Actually send the response
        res.status(mockRes.statusCode);
        Object.entries(mockRes.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.json(data);
      }
    };
    
    // Call the original cloud function
    await generateAltTextProxy(mockReq, mockRes);
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle OPTIONS requests for CORS
app.options('/generate-alt-text', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Connection, Accept, Cache-Control');
  res.status(204).send();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Alt Text Generation Server',
    endpoint: '/generate-alt-text',
    method: 'POST'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Alt Text Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Set' : 'Not set'}`);
}); 