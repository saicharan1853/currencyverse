import { 
  Currency, 
  ExchangeRate, 
  Transaction, 
  User, 
  Wallet, 
  HistoricalRate 
} from '../types';

import { API_CONFIG, httpClient } from '../config/api';

// Get all available currencies
export const getAllCurrencies = async (): Promise<Currency[]> => {
  try {
    const response = await httpClient.get(API_CONFIG.ENDPOINTS.CURRENCIES);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch currencies');
  } catch (error) {
    console.warn('Failed to fetch currencies from API:', error);
    // Return empty array instead of mock data
    return [];
  }
};

// Get current exchange rates
export const getCurrentExchangeRates = async (): Promise<ExchangeRate[]> => {
  try {
    const response = await httpClient.get(API_CONFIG.ENDPOINTS.EXCHANGE_RATES);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch exchange rates');
  } catch (error) {
    console.warn('Failed to fetch exchange rates from API:', error);
    // Return empty array instead of mock data
    return [];
  }
};

// Get exchange rate for a specific currency pair
export const getExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<number> => {
  try {
    const response = await httpClient.get(`${API_CONFIG.ENDPOINTS.EXCHANGE_RATES}/${fromCurrency}/${toCurrency}`);
    if (response.success && response.data) {
      return response.data.rate;
    }
    throw new Error('Exchange rate not found');
  } catch (error) {
    console.warn('Failed to get exchange rate from API:', error);
    // Return 1 as fallback rate
    return 1;
  }
};

// Convert currency
export const convertCurrency = async (
  fromCurrency: string, 
  toCurrency: string, 
  amount: number
): Promise<number> => {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
};

// Get historical rates for a currency pair
export const getHistoricalRates = async (
  fromCurrency: string, 
  toCurrency: string, 
  days: number = 30
): Promise<HistoricalRate[]> => {
  try {
    const response = await httpClient.get(`${API_CONFIG.ENDPOINTS.EXCHANGE_RATES}/historical/${fromCurrency}/${toCurrency}?days=${days}`);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch historical rates');
  } catch (error) {
    console.warn('Failed to fetch historical rates from API:', error);
    // Return empty array instead of mock data
    return [];
  }
};

// Get user transactions
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const response = await httpClient.get(`${API_CONFIG.ENDPOINTS.TRANSACTIONS}/user/${userId}`);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch user transactions');
  } catch (error) {
    console.warn('Failed to fetch user transactions from API:', error);
    return []; // Return empty array instead of mock data
  }
};

// Get all transactions (admin only)
export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await httpClient.get(API_CONFIG.ENDPOINTS.TRANSACTIONS);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch transactions');
  } catch (error) {
    console.warn('Failed to fetch transactions from API:', error);
    return []; // Return empty array instead of mock data
  }
};

// Get current user (deprecated - use useAuth hook instead)
// This function is deprecated and should not be used.
// export const getCurrentUser = (): User => {
//   console.warn('getCurrentUser() is deprecated. Use useAuth hook instead.');
//   return User;
// };

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await httpClient.get(API_CONFIG.ENDPOINTS.USERS);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch users');
  } catch (error) {
    console.warn('Failed to fetch users from API:', error);
    return []; // Return empty array instead of mock data
  }
};

// Get user wallets
export const getUserWallets = async (userId: string): Promise<Wallet[]> => {
  try {
    const response = await httpClient.get(`${API_CONFIG.ENDPOINTS.WALLETS}/user/${userId}`);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch user wallets');
  } catch (error) {
    console.warn('Failed to fetch user wallets from API:', error);
    return [];
  }
};

// Add transaction (save to backend)
export const addTransaction = async (
  fromCurrency: string,
  toCurrency: string,
  fromAmount: number,
  userId?: string
): Promise<Transaction> => {
  try {
    if (!userId) {
      throw new Error('User ID is required for creating transactions');
    }
    
    const transactionData = {
      fromCurrency,
      toCurrency,
      fromAmount,
      userId
    };

    const response = await httpClient.post(API_CONFIG.ENDPOINTS.TRANSACTIONS, transactionData);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create transaction');
  } catch (error) {
    console.warn('Failed to create transaction via API:', error);
    throw error; // Don't fall back to local simulation, just throw the error
  }
};

// Update wallet balance via API
export const updateWalletBalance = async (currencyCode: string, amount: number, userId?: string): Promise<Wallet> => {
  try {
    if (!userId) {
      throw new Error('User ID is required for updating wallet balance');
    }
    
    const response = await httpClient.put(`${API_CONFIG.ENDPOINTS.WALLETS}/user/${userId}/currency/${currencyCode}`, {
      amount
    });
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update wallet balance');
  } catch (error) {
    console.warn('Failed to update wallet balance via API:', error);
    throw error;
  }
};

// Health check function to test backend connectivity
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await httpClient.get(API_CONFIG.ENDPOINTS.HEALTH);
    return response.status === 'OK';
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
};

// Get API connection status
export const getApiStatus = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    const isHealthy = await checkBackendHealth();
    if (isHealthy) {
      return { connected: true, message: 'Connected to backend API' };
    } else {
      return { connected: false, message: 'Backend API is not responding properly' };
    }
  } catch (error) {
    return { connected: false, message: 'Failed to connect to backend API. Using mock data.' };
  }
};
