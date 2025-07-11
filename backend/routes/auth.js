import express from 'express';
import { User } from '../models/index.js';
import { MemoryStorage } from '../utils/memoryStorage.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to determine if we should use memory storage
const useMemoryStorage = () => {
  // Only use memory storage if explicitly set in environment
  return process.env.USE_MEMORY_DB === 'true';
};

// Initialize memory storage with default users if needed
if (process.env.USE_MEMORY_DB === 'true') {
  MemoryStorage.initializeDefaultUsers();
}

// Get current authenticated user (for session validation)
router.get('/me', async (req, res) => {
  try {
    // For this demo application, we'll check if there's an email in the query params
    // In a real app, you would use session tokens, JWT, or cookies for authentication
    const email = req.query.email;
    
    if (!email) {
      // No email provided, return a 401
      return res.status(401).json({
        success: false,
        message: 'No authentication information provided'
      });
    }
    
    let user = null;
    
    if (useMemoryStorage()) {
      // Use memory storage
      user = MemoryStorage.findUserByEmail(email);
    } else {
      // Find the user by email in MongoDB
      user = await User.findOne({ email: email.toLowerCase() });
    }
    
    if (user) {
      // User found, return their details
      console.log(`User authenticated: ${user.name} (${user.email})`);
      
      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;
      
      // Update last active timestamp
      if (useMemoryStorage()) {
        MemoryStorage.updateUser(user._id, { lastActive: new Date() });
      } else {
        user.lastActive = new Date();
        await user.save();
      }
      
      return res.json({
        success: true,
        data: userResponse
      });
    } else {
      // User not found with this email
      console.log(`Authentication failed for email: ${email}`);
      
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during auth check'
    });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log("Register request received:", { name, email });
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    // Check if user already exists with a more robust query
    const normalizedEmail = email.toLowerCase().trim();
    let existingUser = null;
    
    if (useMemoryStorage()) {
      existingUser = MemoryStorage.findUserByEmail(normalizedEmail);
    } else {
      try {
        existingUser = await User.findOne({ email: normalizedEmail });
      } catch (findError) {
        console.error("Error finding user:", findError);
      }
    }
    
    if (existingUser) {
      console.log(`User with email ${normalizedEmail} already exists`);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    console.log(`Creating new user with email ${normalizedEmail}`);
    
    // Create new user data
    const userData = {
      name,
      email: normalizedEmail,
      password, // In production, this should be hashed
      isAdmin: false
    };
    
    let savedUser;
    
    if (useMemoryStorage()) {
      savedUser = MemoryStorage.createUser(userData);
    } else {
      // Create new user with default wallets for MongoDB
      const newUser = new User({
        ...userData,
        wallets: [
          {
            id: `wallet-${Date.now()}-1`,
            currencyCode: 'USD',
            balance: 1000, // Starting balance
            lastUpdated: new Date()
          }
        ],
        joinDate: new Date(),
        lastActive: new Date()
      });
      
      try {
        savedUser = await newUser.save();
        savedUser = savedUser.toObject();
      } catch (saveError) {
        console.error("Error saving user:", saveError);
        
        // Check if this is a duplicate key error
        if (saveError.code === 11000) {
          return res.status(409).json({
            success: false,
            message: 'User with this email already exists (duplicate key)'
          });
        }
        
        throw saveError;
      }
    }
    
    // Remove password from response
    const userResponse = { ...savedUser };
    delete userResponse.password;
    
    console.log("User registered successfully:", userResponse._id);
    
    return res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User registered successfully'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    let user = null;
    
    if (useMemoryStorage()) {
      // Find user in memory storage
      user = MemoryStorage.findUserByEmail(email);
    } else {
      // Find user by email in MongoDB
      user = await User.findOne({ email: email.toLowerCase() });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password (in production, compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last active
    if (useMemoryStorage()) {
      MemoryStorage.updateUser(user._id, { lastActive: new Date() });
    } else {
      user.lastActive = new Date();
      await user.save();
    }
    
    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;
    
    return res.json({
      success: true,
      data: userResponse,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get current user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: userId }
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already taken by another user'
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email: email.toLowerCase(),
        lastActive: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during profile update'
    });
  }
});

// Logout user (client-side mainly, but we can update last active)
router.post('/logout/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Update last active time
    await User.findByIdAndUpdate(userId, { lastActive: new Date() });
    
    return res.json({
      success: true,
      message: 'Logout successful'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
});

// Simple logout without requiring userId
router.get('/logout', async (req, res) => {
  return res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;
