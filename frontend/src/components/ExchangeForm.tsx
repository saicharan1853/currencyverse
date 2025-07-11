import { useState, useEffect } from 'react';
import { AlertTriangle, ArrowDownUp } from 'lucide-react';
import { Currency } from '../types';
import { 
  getAllCurrencies, 
  getExchangeRate, 
  convertCurrency,
  addTransaction 
} from '../services/currencyService';
import { useAuth } from '../contexts/AuthContext';

export default function ExchangeForm() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [amount, setAmount] = useState<string>('100');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currenciesData = await getAllCurrencies();
        setCurrencies(currenciesData);
        if (currenciesData.length > 1) {
          setFromCurrency(currenciesData[0].code);
          setToCurrency(currenciesData[1].code);
        }
      } catch (error) {
        console.error('Failed to load currencies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCurrencies();
  }, []);
  
  const getCurrencyByCode = (code: string): Currency | undefined => {
    return currencies.find(c => c.code === code);
  };
  
  const fromCurrencyObj = getCurrencyByCode(fromCurrency);
  const toCurrencyObj = getCurrencyByCode(toCurrency);
  
  useEffect(() => {
    const updateRate = async () => {
      if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
        try {
          const newRate = await getExchangeRate(fromCurrency, toCurrency);
          setRate(newRate);
          
          const value = parseFloat(amount) || 0;
          const converted = await convertCurrency(fromCurrency, toCurrency, value);
          setConvertedAmount(converted);
        } catch (error) {
          console.error('Failed to get exchange rate:', error);
          setRate(0);
          setConvertedAmount(0);
        }
      }
    };
    
    updateRate();
  }, [fromCurrency, toCurrency, amount]);
  
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user?.id) {
      setError('You must be logged in to make a transaction');
      return;
    }
    
    const value = parseFloat(amount);
    
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add transaction and update wallets
      await addTransaction(fromCurrency, toCurrency, value, user.id);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Reset form
      setAmount('100');
    } catch (err) {
      setError('Failed to complete transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Exchange Currency</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600">Loading currencies...</span>
        </div>
      ) : (
        <>
          {showSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
              Transaction completed successfully!
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="fromAmount" className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="flex">
            <div className="w-full">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {fromCurrencyObj?.symbol}
                  </span>
                </div>
                <input
                  type="text"
                  name="fromAmount"
                  id="fromAmount"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <label htmlFor="fromCurrency" className="sr-only">Currency</label>
                  <select
                    id="fromCurrency"
                    name="fromCurrency"
                    className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    disabled={isSubmitting}
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center my-4">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            onClick={handleSwapCurrencies}
            disabled={isSubmitting}
          >
            <ArrowDownUp className="text-gray-600" size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <label htmlFor="toAmount" className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="flex">
            <div className="w-full">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {toCurrencyObj?.symbol}
                  </span>
                </div>
                <input
                  type="text"
                  name="toAmount"
                  id="toAmount"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3 bg-gray-50"
                  placeholder="0.00"
                  value={convertedAmount.toFixed(2)}
                  readOnly
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <label htmlFor="toCurrency" className="sr-only">Currency</label>
                  <select
                    id="toCurrency"
                    name="toCurrency"
                    className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    disabled={isSubmitting}
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6 bg-gray-50 p-3 rounded-md">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Exchange Rate:</span>
            <span className="font-medium">
              1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
            </span>
          </div>
        </div>
        
        <button
          type="submit"
          className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-colors ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Exchange Now'}
        </button>
      </form>
      </>
      )}
    </div>
  );
}
