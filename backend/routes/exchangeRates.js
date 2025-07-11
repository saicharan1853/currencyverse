import express from 'express';
import { ExchangeRate } from '../models/index.js';

const router = express.Router();

// GET /api/exchange-rates - Get all current exchange rates
router.get('/', async (req, res) => {
  try {
    const exchangeRates = await ExchangeRate.find().sort({ fromCurrency: 1, toCurrency: 1 });
    
    const response = {
      success: true,
      data: exchangeRates,
      message: 'Exchange rates retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve exchange rates',
    };
    res.status(500).json(response);
  }
});

// GET /api/exchange-rates/:from/:to - Get specific exchange rate
router.get('/:from/:to', async (req, res) => {
  try {
    const { from, to } = req.params;
    
    if (!from || !to) {
      const response = {
        success: false,
        error: 'Invalid parameters',
        message: 'Both from and to currency codes are required',
      };
      return res.status(400).json(response);
    }

    // Handle same currency conversion
    if (from.toUpperCase() === to.toUpperCase()) {
      const response = {
        success: true,
        data: {
          fromCurrency: from.toUpperCase(),
          toCurrency: to.toUpperCase(),
          rate: 1,
          lastUpdated: new Date().toISOString(),
        },
        message: 'Exchange rate retrieved successfully',
      };
      return res.json(response);
    }

    const exchangeRate = await ExchangeRate.findOne({
      fromCurrency: from.toUpperCase(),
      toCurrency: to.toUpperCase()
    });
    
    if (!exchangeRate) {
      const response = {
        success: false,
        error: 'Exchange rate not found',
        message: `Exchange rate from ${from.toUpperCase()} to ${to.toUpperCase()} not available`,
      };
      return res.status(404).json(response);
    }
    
    const response = {
      success: true,
      data: exchangeRate,
      message: 'Exchange rate retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve exchange rate',
    };
    res.status(500).json(response);
  }
});

// GET /api/exchange-rates/:from/:to/historical - Get historical rates
router.get('/:from/:to/historical', async (req, res) => {
  try {
    const { from, to } = req.params;
    const days = parseInt(req.query.days) || 30;
    
    if (!from || !to) {
      const response = {
        success: false,
        error: 'Invalid parameters',
        message: 'Both from and to currency codes are required',
      };
      return res.status(400).json(response);
    }

    // Get current rate
    const currentExchangeRate = await ExchangeRate.findOne({
      fromCurrency: from.toUpperCase(),
      toCurrency: to.toUpperCase()
    });

    if (!currentExchangeRate) {
      const response = {
        success: false,
        error: 'Exchange rate not found',
        message: `Exchange rate from ${from.toUpperCase()} to ${to.toUpperCase()} not available`,
      };
      return res.status(404).json(response);
    }

    // Generate historical data (mock historical data based on current rate)
    const historicalData = [];
    const currentRate = currentExchangeRate.rate;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const fluctuation = 0.95 + Math.random() * 0.1;
      const rate = currentRate * fluctuation;
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(rate.toFixed(4)),
      });
    }
    
    const response = {
      success: true,
      data: historicalData,
      message: 'Historical exchange rates retrieved successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    const response = {
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve historical rates',
    };
    res.status(500).json(response);
  }
});

export default router;
