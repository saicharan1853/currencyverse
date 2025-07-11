import { useState, useEffect } from 'react';
import { Wallet, Currency } from '../types';
import { Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { getAllCurrencies } from '../services/currencyService';

interface WalletCardProps {
  wallet: Wallet;
  onAddFunds: (wallet: Wallet) => void;
  onWithdraw?: (wallet: Wallet) => void;
}

export default function WalletCard({ wallet, onAddFunds, onWithdraw }: WalletCardProps) {
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const currenciesData = await getAllCurrencies();
        const matchingCurrency = currenciesData.find((c: Currency) => c.code === wallet.currencyCode);
        setCurrency(matchingCurrency || null);
      } catch (error) {
        console.error('Error fetching currency data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrencies();
  }, [wallet.currencyCode]);
  
  if (loading) return <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>;
  if (!currency) return null;
  
  // Generate random trend for demo purposes (in a real app this would be based on actual historical data)
  const isPositive = Math.random() > 0.3; // 70% chance of positive trend for demo
  const trendPercentage = (Math.random() * 3).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
              {currency.flag}
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-800">{currency.name}</h3>
              <p className="text-gray-500 text-sm">{wallet.currencyCode}</p>
            </div>
          </div>
          <div className={`flex items-center ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? 
              <TrendingUp className="w-4 h-4 mr-1" /> : 
              <TrendingDown className="w-4 h-4 mr-1" />
            }
            <span className="text-sm font-medium">{trendPercentage}%</span>
          </div>
        </div>
        
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {currency.symbol} {wallet.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onAddFunds(wallet)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 transition-colors"
                title="Add funds"
              >
                <Plus size={16} />
              </button>
              {onWithdraw && (
                <button
                  onClick={() => onWithdraw(wallet)}
                  className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-2 transition-colors"
                  title="Withdraw funds"
                >
                  <Minus size={16} />
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {new Date(wallet.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
