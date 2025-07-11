import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, CreditCard, Plus, TrendingUp, X } from 'lucide-react';
import WalletCard from '../components/WalletCard';
import CurrencyCard from '../components/CurrencyCard';
import RateChart from '../components/RateChart';
import { 
  getAllCurrencies, 
  getCurrentExchangeRates,
  getApiStatus
} from '../services/currencyService';
import { Currency, ExchangeRate } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [apiStatus, setApiStatus] = useState<{ connected: boolean; message: string }>({ connected: false, message: 'Checking...' });
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  
  console.log('📊 DashboardPage rendering with user:', user?.email);

  useEffect(() => {
    const loadData = async () => {
      console.log('📡 DashboardPage: Loading data...');
      setLoading(true);
      try {
        // Check API status
        console.log('🔍 Checking API status...');
        const status = await getApiStatus();
        console.log('📡 API Status:', status);
        setApiStatus(status);

        // Load currencies and exchange rates
        console.log('💰 Loading currencies and exchange rates...');
        const [currenciesData, exchangeRatesData] = await Promise.all([
          getAllCurrencies(),
          getCurrentExchangeRates()
        ]);
        
        console.log('📊 Loaded data:', { 
          currencies: currenciesData.length, 
          exchangeRates: exchangeRatesData.length 
        });
        
        setCurrencies(currenciesData);
        setExchangeRates(exchangeRatesData);
      } catch (error) {
        console.error('💥 Error loading dashboard data:', error);
        setApiStatus({ connected: false, message: 'Failed to load data' });
      } finally {
        console.log('✅ Dashboard data loading complete');
        setLoading(false);
      }
    };

    loadData();
  }, []);
  
  // Get common currency pairs for display
  const commonPairs = [
    { base: 'USD', quote: 'EUR' },
    { base: 'EUR', quote: 'GBP' },
    { base: 'USD', quote: 'JPY' },
    { base: 'GBP', quote: 'USD' },
  ];
  
  const currencyPairs = commonPairs.map(pair => {
    const baseCurrency = currencies.find(c => c.code === pair.base);
    const quoteCurrency = currencies.find(c => c.code === pair.quote);
    const rate = exchangeRates.find(
      r => r.fromCurrency === pair.base && r.toCurrency === pair.quote
    );
    
    if (baseCurrency && quoteCurrency && rate) {
      return {
        baseCurrency,
        quoteCurrency,
        rate
      };
    }
    return null;
  }).filter(Boolean);
  
  const handleAddFunds = (wallet: { currencyCode: string }) => {
    setSelectedWallet(wallet.currencyCode);
    setShowAddFundsModal(true);
  };
  
  const handleAddFundsSubmit = () => {
    // This would typically interact with a payment processor in a real app
    setShowAddFundsModal(false);
    setAmount('');
  };
  
  // Select main chart currencies
  const defaultFromCurrency = 'USD';
  const defaultToCurrency = 'EUR';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {user?.name || 'User'}</h1>
        <p className="text-gray-600">Here's an overview of your currencies and the latest exchange rates.</p>
        
        {/* API Status Indicator */}
        <div className="mt-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            apiStatus.connected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              apiStatus.connected ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            {apiStatus.message}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <WalletIcon className="h-6 w-6" />
            </div>
            <h2 className="ml-3 text-lg font-semibold">My Wallets</h2>
          </div>
          <div className="text-3xl font-bold mb-1">{user?.wallets?.length || 0}</div>
          <p className="text-blue-100">Active currency wallets</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
            <h2 className="ml-3 text-lg font-semibold">Total Balance</h2>
          </div>
          <div className="text-3xl font-bold mb-1">
            ${(user?.wallets || [])
              .filter((wallet: any) => wallet.currencyCode === 'USD')
              .reduce((sum: number, wallet: any) => sum + wallet.balance, 0)
              .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-purple-100">USD equivalent</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h2 className="ml-3 text-lg font-semibold">Active Rates</h2>
          </div>
          <div className="text-3xl font-bold mb-1">{exchangeRates.length}</div>
          <p className="text-green-100">Currency pairs available</p>
        </div>
      </div>
    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RateChart 
            fromCurrency={defaultFromCurrency} 
            toCurrency={defaultToCurrency} 
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">My Wallets</h2>
            <button 
              onClick={() => setShowAddFundsModal(true)}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Funds
            </button>
          </div>
          
          <div className="space-y-4">
            {(user?.wallets || []).map((wallet: any) => (
              <WalletCard 
                key={wallet.id} 
                wallet={wallet} 
                onAddFunds={handleAddFunds}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Currency Pairs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currencyPairs.map((pair, index) => (
            pair && (
              <CurrencyCard
                key={index}
                baseCurrency={pair.baseCurrency}
                quoteCurrency={pair.quoteCurrency}
                rate={pair.rate}
              />
            )
          ))}
        </div>
      </div>
      
      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Add Funds to {selectedWallet} Wallet
              </h3>
              <button 
                onClick={() => setShowAddFundsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {currencies.find(c => c.code === selectedWallet)?.symbol}
                  </span>
                </div>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">{selectedWallet}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="creditCard">Credit Card</option>
                <option value="bankTransfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddFundsModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFundsSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
