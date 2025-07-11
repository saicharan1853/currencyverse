export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  wallets: Wallet[];
  joinDate: string;
  lastActive: string;
}

export interface Wallet {
  id: string;
  currencyCode: string;
  balance: number;
  lastUpdated: string;
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateTransactionRequest {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
}

export interface UpdateWalletRequest {
  amount: number;
  operation: 'add' | 'subtract';
}
