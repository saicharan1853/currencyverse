import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    // unique field is handled by explicit index below
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  wallets: [{
    id: String,
    currencyCode: String,
    balance: Number,
    lastUpdated: Date
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure index is properly created
userSchema.index({ email: 1 }, { unique: true });

// Add pre-save hook to handle validation
userSchema.pre('save', async function(next) {
  // Only run this validation if the email is modified
  if (!this.isModified('email')) {
    return next();
  }

  try {
    // Check if there's another user with this email
    const User = mongoose.model('User');
    const existingUser = await User.findOne({ email: this.email, _id: { $ne: this._id } });
    
    if (existingUser) {
      const error = new Error('Email already in use');
      return next(error);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  fromCurrency: {
    type: String,
    required: true
  },
  toCurrency: {
    type: String,
    required: true
  },
  fromAmount: {
    type: Number,
    required: true
  },
  toAmount: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Currency Schema
const currencySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  flag: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Exchange Rate Schema
const exchangeRateSchema = new mongoose.Schema({
  fromCurrency: {
    type: String,
    required: true
  },
  toCurrency: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Wallet Schema
const walletSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  currencyCode: {
    type: String,
    required: true,
    uppercase: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better performance
transactionSchema.index({ userId: 1, date: -1 });
exchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1 });
walletSchema.index({ userId: 1, currencyCode: 1 });

// Export models
export const User = mongoose.model('User', userSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Currency = mongoose.model('Currency', currencySchema);
export const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);
export const Wallet = mongoose.model('Wallet', walletSchema);
