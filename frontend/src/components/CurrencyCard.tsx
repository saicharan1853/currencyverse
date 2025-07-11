import { useState, useEffect } from 'react';
import { RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { Currency, ExchangeRate, HistoricalRate } from '../types';
import { getHistoricalRates } from '../services/currencyService';

interface CurrencyCardProps {
  baseCurrency: Currency;
  quoteCurrency: Currency;
  rate: ExchangeRate;
}

export default function CurrencyCard({ baseCurrency, quoteCurrency, rate }: CurrencyCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalRate[]>([]);
  
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const data = await getHistoricalRates(baseCurrency.code, quoteCurrency.code, 7);
        setHistoricalData(data);
      } catch (error) {
        console.error('Failed to load historical data:', error);
        setHistoricalData([]);
      }
    };
    
    loadHistoricalData();
  }, [baseCurrency.code, quoteCurrency.code]);
  
  // Get historical data to determine trend
  const oldRate = historicalData.length > 0 ? historicalData[0].rate : rate.rate;
  const currentRate = rate.rate;
  
  const percentChange = ((currentRate - oldRate) / oldRate) * 100;
  const isPositive = percentChange >= 0;
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{baseCurrency.flag}</span>
            <span className="font-semibold text-gray-800">{baseCurrency.code}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-gray-800">{quoteCurrency.code}</span>
            <span className="text-2xl ml-2">{quoteCurrency.flag}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold">
              {quoteCurrency.symbol} {rate.rate.toFixed(4)}
            </div>
            <div className="text-sm text-gray-500">
              1 {baseCurrency.code} = {rate.rate.toFixed(4)} {quoteCurrency.code}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className={`flex items-center ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? 
                <TrendingUp className="w-4 h-4 mr-1" /> : 
                <TrendingDown className="w-4 h-4 mr-1" />
              }
              <span className="font-medium">{Math.abs(percentChange).toFixed(2)}%</span>
            </div>
            <div className="text-xs text-gray-500">Last 7 days</div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm">
          <span className="text-gray-500">
            Updated {new Date(rate.lastUpdated).toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
