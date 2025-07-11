import express from 'express';
import { User } from '../models/index.js';

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    
    const response = {
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve users',
    };
    res.status(500).json(response);
  }
});

// GET /api/users/:id - Get specific user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      const response = {
        success: false,
        error: 'User not found',
        message: `User with ID ${id} does not exist`,
      };
      return res.status(404).json(response);
    }
    
    const response = {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve user',
    };
    res.status(500).json(response);
  }
});

// PUT /api/users/:id - Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    if (!name || !email) {
      const response = {
        success: false,
        error: 'Missing required fields',
        message: 'Name and email are required',
      };
      return res.status(400).json(response);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        name, 
        email,
        lastActive: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      const response = {
        success: false,
        error: 'User not found',
        message: `User with ID ${id} does not exist`,
      };
      return res.status(404).json(response);
    }
    
    const response = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to update user',
    };
    res.status(500).json(response);
  }
});

export default router;
