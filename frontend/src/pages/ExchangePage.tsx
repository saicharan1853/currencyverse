import { useState, useEffect } from 'react';
import { ArrowUpRight, CircleHelp, TrendingUp, ArrowLeftRight } from 'lucide-react';
import RateChart from '../components/RateChart';
import { getAllCurrencies, getCurrentExchangeRates } from '../services/currencyService';
import { Currency, ExchangeRate } from '../types';

// Inline ExchangeForm component to ensure proper integration
const ExchangeForm = ({ 
  selectedFromCurrency, 
  selectedToCurrency, 
  onFromCurrencyChange, 
  onToCurrencyChange,
  currencies,
  exchangeRates
}: {
  selectedFromCurrency: string;
  selectedToCurrency: string;
  onFromCurrencyChange: (currency: string) => void;
  onToCurrencyChange: (currency: string) => void;
  currencies: Currency[];
  exchangeRates: ExchangeRate[];
}) => {
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState('');

  // Calculate converted amount whenever currencies or amount changes
  useEffect(() => {
    const rate = exchangeRates.find(
      r => r.fromCurrency === selectedFromCurrency && r.toCurrency === selectedToCurrency
    );
    if (rate && amount) {
      setConvertedAmount((parseFloat(amount) * rate.rate).toFixed(2));
    }
  }, [selectedFromCurrency, selectedToCurrency, amount, exchangeRates]);

  const handleSwapCurrencies = () => {
    onFromCurrencyChange(selectedToCurrency);
    onToCurrencyChange(selectedFromCurrency);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <div className="flex space-x-2">
            <select
              value={selectedFromCurrency}
              onChange={(e) => onFromCurrencyChange(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Amount"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSwapCurrencies}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <ArrowLeftRight size={20} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <div className="flex space-x-2">
            <select
              value={selectedToCurrency}
              onChange={(e) => onToCurrencyChange(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={convertedAmount}
              readOnly
              className="w-32 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              placeholder="Result"
            />
          </div>
        </div>

        <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          Convert Currency
        </button>
      </div>
    </div>
  );
};

export default function ExchangePage() {
  const [selectedFromCurrency, setSelectedFromCurrency] = useState('USD');
  const [selectedToCurrency, setSelectedToCurrency] = useState('EUR');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentPairs, setRecentPairs] = useState([
    { from: 'USD', to: 'EUR' },
    { from: 'EUR', to: 'GBP' },
    { from: 'USD', to: 'JPY' },
    { from: 'GBP', to: 'USD' },
  ]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [currenciesData, exchangeRatesData] = await Promise.all([
          getAllCurrencies(),
          getCurrentExchangeRates()
        ]);
        setCurrencies(currenciesData);
        setExchangeRates(exchangeRatesData);
      } catch (error) {
        console.error('Error loading exchange data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  
  // Function to handle currency changes and update chart
  const handleFromCurrencyChange = (newFromCurrency: string) => {
    console.log('From currency changed to:', newFromCurrency);
    setSelectedFromCurrency(newFromCurrency);
    updateRecentExchanges(newFromCurrency, selectedToCurrency);
  };

  const handleToCurrencyChange = (newToCurrency: string) => {
    console.log('To currency changed to:', newToCurrency);
    setSelectedToCurrency(newToCurrency);
    updateRecentExchanges(selectedFromCurrency, newToCurrency);
  };

  const updateRecentExchanges = (fromCurrency: string, toCurrency: string) => {
    const newPair = { from: fromCurrency, to: toCurrency };
    setRecentPairs(prevPairs => {
      const existingIndex = prevPairs.findIndex(
        pair => pair.from === fromCurrency && pair.to === toCurrency
      );
      
      if (existingIndex === -1) {
        return [newPair, ...prevPairs.slice(0, 3)];
      } else {
        const updatedPairs = [...prevPairs];
        updatedPairs.splice(existingIndex, 1);
        return [newPair, ...updatedPairs];
      }
    });
  };
  
  const handleSelectPair = (from: string, to: string) => {
    setSelectedFromCurrency(from);
    setSelectedToCurrency(to);
    updateRecentExchanges(from, to);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading exchange data...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Currency Exchange</h1>
          <ExchangeForm 
            selectedFromCurrency={selectedFromCurrency}
            selectedToCurrency={selectedToCurrency}
            onFromCurrencyChange={handleFromCurrencyChange}
            onToCurrencyChange={handleToCurrencyChange}
            currencies={currencies}
            exchangeRates={exchangeRates}
          />
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Exchanges</h2>
            <div className="bg-white rounded-lg shadow-md divide-y divide-gray-100">
              {recentPairs.map((pair, index) => {
                const fromCurrency = currencies.find(c => c.code === pair.from);
                const toCurrency = currencies.find(c => c.code === pair.to);
                const rate = exchangeRates.find(
                  r => r.fromCurrency === pair.from && r.toCurrency === pair.to
                );
                
                if (!fromCurrency || !toCurrency || !rate) return null;
                
                const isSelected = pair.from === selectedFromCurrency && pair.to === selectedToCurrency;
                
                return (
                  <div 
                    key={`${pair.from}-${pair.to}-${index}`}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                    }`}
                    onClick={() => handleSelectPair(pair.from, pair.to)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{fromCurrency.flag}</span>
                          <span className="font-medium">{fromCurrency.code}</span>
                        </div>
                        <ArrowUpRight className="mx-2 text-gray-400" size={16} />
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{toCurrency.flag}</span>
                          <span className="font-medium">{toCurrency.code}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                        <span>{rate.rate.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-8 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-start">
              <CircleHelp className="w-5 h-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-indigo-800 mb-1">Exchange Tips</h3>
                <ul className="text-sm text-indigo-700 space-y-2">
                  <li>• Monitor exchange rates before making large conversions</li>
                  <li>• Consider setting up rate alerts for your frequent currency pairs</li>
                  <li>• Exchange during weekdays for more favorable rates</li>
                  <li>• Compare our rates with other providers for the best deal</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Historical Exchange Rate ({selectedFromCurrency}/{selectedToCurrency})
            </h2>
            <RateChart 
              fromCurrency={selectedFromCurrency} 
              toCurrency={selectedToCurrency}
              key={`chart-${selectedFromCurrency}-${selectedToCurrency}`}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Exchange Rate Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">About This Currency Pair</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The {selectedFromCurrency}/{selectedToCurrency} pair represents the exchange rate between 
                  the {currencies.find(c => c.code === selectedFromCurrency)?.name} and 
                  the {currencies.find(c => c.code === selectedToCurrency)?.name}. 
                  This is one of the world's most traded currency pairs, with significant 
                  liquidity and narrow spreads.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Market Factors</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This exchange rate is influenced by economic indicators like interest rates, 
                  inflation, GDP growth, central bank policies, and geopolitical events. 
                  Trading volume is typically highest during overlapping market hours.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Volatility</h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Medium</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  This pair typically shows moderate volatility compared to emerging market currencies.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Exchange Fee</h3>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium text-indigo-600">0.5%</span> per transaction
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Premium accounts enjoy reduced fees and additional benefits. 
                  <a href="#" className="text-indigo-600 ml-1 hover:underline">
                    Learn more
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}