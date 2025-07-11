import express from 'express';
import { Transaction } from '../models/index.js';

const router = express.Router();

// GET /api/transactions - Get all transactions
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let filter = {};
    if (userId) {
      filter.userId = userId;
    }
    
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    
    const response = {
      success: true,
      data: transactions,
      message: 'Transactions retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve transactions',
    };
    res.status(500).json(response);
  }
});

// GET /api/transactions/:id - Get specific transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      const response = {
        success: false,
        error: 'Transaction not found',
        message: `Transaction with ID ${id} does not exist`,
      };
      return res.status(404).json(response);
    }
    
    const response = {
      success: true,
      data: transaction,
      message: 'Transaction retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve transaction',
    };
    res.status(500).json(response);
  }
});

// POST /api/transactions - Create new transaction
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      rate
    } = req.body;
    
    if (!userId || !fromCurrency || !toCurrency || !fromAmount || !toAmount || !rate) {
      const response = {
        success: false,
        error: 'Missing required fields',
        message: 'All transaction fields are required',
      };
      return res.status(400).json(response);
    }

    const transaction = new Transaction({
      userId,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      fromAmount,
      toAmount,
      rate,
      status: 'completed',
      date: new Date()
    });
    
    const savedTransaction = await transaction.save();
    
    const response = {
      success: true,
      data: savedTransaction,
      message: 'Transaction created successfully',
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating transaction:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to create transaction',
    };
    res.status(500).json(response);
  }
});

// PUT /api/transactions/:id - Update transaction status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'completed', 'failed'].includes(status)) {
      const response = {
        success: false,
        error: 'Invalid status',
        message: 'Status must be pending, completed, or failed',
      };
      return res.status(400).json(response);
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      const response = {
        success: false,
        error: 'Transaction not found',
        message: `Transaction with ID ${id} does not exist`,
      };
      return res.status(404).json(response);
    }
    
    const response = {
      success: true,
      data: transaction,
      message: 'Transaction updated successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating transaction:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to update transaction',
    };
    res.status(500).json(response);
  }
});

// GET /api/transactions/user/:userId - Get transactions for a specific user
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
    
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    
    const response = {
      success: true,
      data: transactions,
      message: 'User transactions retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve user transactions',
    };
    res.status(500).json(response);
  }
});

export default router;
