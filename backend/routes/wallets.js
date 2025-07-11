import express from 'express';
import { Wallet } from '../models/index.js';

const router = express.Router();

// GET /api/wallets - Get all wallets
router.get('/', async (req, res) => {
  try {
    const wallets = await Wallet.find().sort({ currencyCode: 1 });
    
    const response = {
      success: true,
      data: wallets,
      message: 'Wallets retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve wallets',
    };
    res.status(500).json(response);
  }
});

// GET /api/wallets/user/:userId - Get wallets for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      const response = {
        success: false,
        error: 'Invalid parameter',
        message: 'User ID is required',
      };
      return res.status(400).json(response);
    }
    
    const wallets = await Wallet.find({ userId }).sort({ currencyCode: 1 });
    
    const response = {
      success: true,
      data: wallets,
      message: 'User wallets retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching user wallets:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve user wallets',
    };
    res.status(500).json(response);
  }
});

// PUT /api/wallets/user/:userId/currency/:currencyCode - Update wallet balance
router.put('/user/:userId/currency/:currencyCode', async (req, res) => {
  try {
    const { userId, currencyCode } = req.params;
    const { amount } = req.body;
    
    if (!userId || !currencyCode) {
      const response = {
        success: false,
        error: 'Invalid parameters',
        message: 'User ID and currency code are required',
      };
      return res.status(400).json(response);
    }
    
    if (typeof amount !== 'number') {
      const response = {
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be a number',
      };
      return res.status(400).json(response);
    }
    
    // Find existing wallet or create new one
    let wallet = await Wallet.findOne({ userId, currencyCode: currencyCode.toUpperCase() });
    
    if (wallet) {
      // Update existing wallet
      wallet.balance += amount;
      wallet.lastUpdated = new Date().toISOString();
      await wallet.save();
    } else if (amount >= 0) {
      // Create new wallet only if amount is positive
      wallet = new Wallet({
        userId,
        currencyCode: currencyCode.toUpperCase(),
        balance: amount,
        lastUpdated: new Date().toISOString(),
      });
      await wallet.save();
    } else {
      const response = {
        success: false,
        error: 'Insufficient funds',
        message: 'Cannot create wallet with negative balance',
      };
      return res.status(400).json(response);
    }
    
    const response = {
      success: true,
      data: wallet,
      message: 'Wallet updated successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating wallet:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to update wallet',
    };
    res.status(500).json(response);
  }
});

// POST /api/wallets - Create a new wallet
router.post('/', async (req, res) => {
  try {
    const { userId, currencyCode, balance = 0 } = req.body;
    
    if (!userId || !currencyCode) {
      const response = {
        success: false,
        error: 'Missing required fields',
        message: 'User ID and currency code are required',
      };
      return res.status(400).json(response);
    }
    
    // Check if wallet already exists
    const existingWallet = await Wallet.findOne({ 
      userId, 
      currencyCode: currencyCode.toUpperCase() 
    });
    
    if (existingWallet) {
      const response = {
        success: false,
        error: 'Wallet already exists',
        message: `Wallet for ${currencyCode.toUpperCase()} already exists for this user`,
      };
      return res.status(409).json(response);
    }
    
    const wallet = new Wallet({
      userId,
      currencyCode: currencyCode.toUpperCase(),
      balance,
      lastUpdated: new Date().toISOString(),
    });
    
    await wallet.save();
    
    const response = {
      success: true,
      data: wallet,
      message: 'Wallet created successfully',
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating wallet:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to create wallet',
    };
    res.status(500).json(response);
  }
});

export default router;