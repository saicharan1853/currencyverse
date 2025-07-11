import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Maximum number of connection retries
const MAX_RETRIES = 5;
let retryCount = 0;
let retryTimeoutId;

// Connection retry function
const retryConnection = async () => {
  if (retryCount < MAX_RETRIES) {
    retryCount++;
    const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30 seconds
    console.log(`🔄 Attempt ${retryCount}/${MAX_RETRIES}: Retrying connection in ${backoffTime/1000} seconds...`);
    
    clearTimeout(retryTimeoutId);
    retryTimeoutId = setTimeout(async () => {
      try {
        await connectDB();
      } catch (error) {
        console.error('❌ Retry connection failed:', error.message);
      }
    }, backoffTime);
  } else {
    console.error(`❌ Failed to connect after ${MAX_RETRIES} attempts. Using mock data mode.`);
    return null;
  }
};

const connectDB = async () => {
  try {
    // Check if we should use memory database fallback
    if (process.env.USE_MEMORY_DB === 'true') {
      console.log('🟡 Using memory database fallback mode');
      console.log('⚠️  Note: Data will not persist between server restarts');
      return null; // This will trigger the in-memory fallback in models
    }

    // MongoDB connection options (updated for newer versions)
    const options = {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.DATABASE_URL, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Reset retry count on successful connection
    retryCount = 0;
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
      retryCount = 0; // Reset retry count when reconnected
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose disconnected from MongoDB');
      retryConnection();
    });

    // Check connection status periodically
    setInterval(async () => {
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️ Database connection lost, attempting to reconnect...');
        retryConnection();
      }
    }, 30000); // Check every 30 seconds

    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      console.log('🔄 Network or server selection error, attempting to retry...');
      return await retryConnection();
    }
    
    // Fallback to mock data mode
    console.log('🔄 Falling back to mock data mode...');
    console.log('📝 Using local mock data instead of database');
    
    // Don't exit the process, continue with mock data
    return null;
  }
};

// Validate database connection
export const validateConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Database connection validation failed:', error.message);
    return false;
  }
};

export default connectDB;
