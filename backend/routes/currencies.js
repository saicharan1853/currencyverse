import express from 'express';
import { Currency } from '../models/index.js';

const router = express.Router();

// GET /api/currencies - Get all available currencies
router.get('/', async (req, res) => {
  try {
    const currencies = await Currency.find().sort({ code: 1 });
    
    const response = {
      success: true,
      data: currencies,
      message: 'Currencies retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve currencies',
    };
    res.status(500).json(response);
  }
});

// GET /api/currencies/:code - Get specific currency by code
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const currency = await Currency.findOne({ 
      code: { $regex: new RegExp(code, 'i') } 
    });
    
    if (!currency) {
      const response = {
        success: false,
        error: 'Currency not found',
        message: `Currency with code ${code} does not exist`,
      };
      return res.status(404).json(response);
    }
    
    const response = {
      success: true,
      data: currency,
      message: 'Currency retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching currency:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve currency',
    };
    res.status(500).json(response);
  }
});

export default router;
