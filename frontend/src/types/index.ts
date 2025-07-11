export type Currency = {
  code: string;
  name: string;
  symbol: string;
  flag: string;
};

export type ExchangeRate = {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: string;
};

export type Transaction = {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
};

export type User = {
  id?: string;
  _id?: string; // MongoDB ID format
  name: string;
  email: string;
  isAdmin: boolean;
  wallets: Wallet[];
  joinDate: string;
  lastActive: string;
};

export type Wallet = {
  id: string;
  currencyCode: string;
  balance: number;
  lastUpdated: string;
};

export type HistoricalRate = {
  date: string;
  rate: number;
};
