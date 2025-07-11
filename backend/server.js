import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';  // Add mongoose import

// Import database connection
import connectDB from './config/database.js';

// Import modular route handlers
import currencyRoutes from './routes/currencies.js';
import exchangeRateRoutes from './routes/exchangeRates.js';
import transactionRoutes from './routes/transactions.js';
import userRoutes from './routes/users.js';
import walletRoutes from './routes/wallets.js';
import authRoutes from './routes/auth.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// ========================
// Middleware
// ========================

// Apply security headers using Helmet
app.use(helmet());

// Apply rate limiting to prevent abuse (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'], // Allow all development origins
  credentials: true, // Allow credentials like cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming requests with JSON payloads
app.use(express.json());
// Parse incoming requests with URL-encoded payloads (form submissions)
app.use(express.urlencoded({ extended: true }));

// ========================
// Routes
// ========================

// Modular routes for different parts of the application
app.use('/api/currencies', currencyRoutes);
app.use('/api/exchange-rates', exchangeRateRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/auth', authRoutes);

// ========================
// Health Check
// ========================

// Simple health check endpoint to verify server status
app.get('/api/health', async (req, res) => {
  // Check database connection
  const dbStatus = mongoose.connection.readyState;
  
  // Map readyState to a human-readable status
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    4: 'invalid credentials'
  };

  res.json({
    status: 'OK',
    database: {
      status: dbStatusMap[dbStatus] || 'unknown',
      connected: dbStatus === 1
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ========================
// Error Handling Middleware
// ========================

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack trace

  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    // Show detailed message in development only
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// ========================
// 404 Handler (Catch-all)
// ========================

// Handle all unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist.`,
  });
});

// ========================
// Server Start
// ========================

const PORT = process.env.PORT || 4000;

// Start the server with database connection
const startServer = async () => {
  try {
    // Start the Express server first (don't wait for DB)
    const server = app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 CurrencyVerse Backend Server Started`);
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Connect to MongoDB (can happen in parallel with server startup)
    console.log('🔄 Attempting to connect to MongoDB...');
    const dbConnection = await connectDB();
    
    if (dbConnection) {
      console.log('✅ MongoDB Connected');
      console.log('🎯 Application running in DATABASE mode');
    } else {
      console.log('⚠️  Running in MOCK DATA mode');
      console.log('📝 Using local mock data for development');
    }
    
    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('👋 Received shutdown signal, closing connections...');
      await mongoose.connection.close();
      server.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export the app for testing or external usage
export default app;
