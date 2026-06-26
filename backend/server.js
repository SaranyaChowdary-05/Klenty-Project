const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { connectDB, isJsonFallback } = require('./config/database');
const { initModels } = require('./models/index');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize server
const startServer = async () => {
  try {
    // 1. Database Connection
    console.log('🔄 Connecting to database...');
    const { sequelize, useJsonFallback } = await connectDB();

    if (!useJsonFallback && sequelize) {
      // Initialize and sync Sequelize models
      initModels();
      // Sync schema in DB (runs in development/testing context)
      await sequelize.sync({ alter: true });
      console.log('✅ Sequelize models synchronized');
    } else {
      console.log('💡 SprintHub running in JSON In-Memory Store Fallback Mode');
    }

    // 2. Middlewares
    app.use(helmet({
      crossOriginResourcePolicy: false // allow serving files from uploads folder to other origins
    }));
    app.use(morgan('dev'));
    
    // CORS configuration (Dynamic origin reflection to prevent Vercel cross-domain blocks)
    app.use(cors({
      origin: (origin, callback) => {
        callback(null, true);
      },
      credentials: true,
      optionsSuccessStatus: 200
    }));
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 3. Static Uploads Folder
    const uploadsPath = path.join(__dirname, 'uploads');
    app.use('/uploads', express.static(uploadsPath));

    // Serve frontend compiled static files
    const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
    console.log(`📡 Serving static frontend assets from: ${frontendDistPath}`);
    app.use(express.static(frontendDistPath));

    // 4. API Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/projects', require('./routes/projects'));
    app.use('/api/tasks', require('./routes/tasks'));
    app.use('/api/dashboard', require('./routes/dashboard'));
    app.use('/api/notifications', require('./routes/notifications'));

    // Base API Healthcheck Route
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'SprintHub API service is online and healthy.',
        databaseMode: isJsonFallback() ? 'JSON Memory Store (Fallback)' : 'MySQL/Sequelize (Production)'
      });
    });

    // SPA fallback routing: send index.html for all non-API and non-uploads paths
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
        if (err) {
          console.error(`❌ Error sending index.html to client from ${frontendDistPath}:`, err.message || err);
          next();
        }
      });
    });

    // 5. Error Handlers
    app.use(notFound);
    app.use(errorHandler);

    // 6. Listen
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health check URL: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
