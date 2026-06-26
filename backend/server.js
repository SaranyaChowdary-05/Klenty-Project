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
          res.status(200).send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>SprintHub API Engine</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; background: #0f0f1a; color: #e5e7eb; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                  .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 2.5rem; border-radius: 1.5rem; max-width: 450px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
                  h1 { background: linear-gradient(135deg, #a78bfa, #22d3ee); -webkit-background-clip: text; -webkit-text-fillColor: transparent; margin: 0 0 0.5rem 0; font-size: 1.75rem; font-weight: 800; }
                  p { color: #9ca3af; font-size: 0.875rem; line-height: 1.5; margin: 0 0 1.5rem 0; }
                  .tag { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(16, 185, 129, 0.1); color: #10b981; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 1.5rem; }
                </style>
              </head>
              <body>
                <div class="card">
                  <span class="tag">Online</span>
                  <h1>SprintHub API Engine</h1>
                  <p>The backend server is running successfully! If you deployed the frontend to Vercel, please access your portal using your Vercel deployment link.</p>
                </div>
              </body>
            </html>
          `);
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
