import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getAllCurrencies, getExchangeRate } from '../services/currencyService';
import CurrencyTable from '../components/CurrencyTable';
import { Currency } from '../types';

export default function MarketPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'code' | 'name' | 'rate'>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        const currenciesData = await getAllCurrencies();
        setCurrencies(currenciesData);
        if (currenciesData.length > 0) {
          setBaseCurrency(currenciesData[0].code);
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const handleSort = (column: 'code' | 'name' | 'rate') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const filteredCurrencies = currencies.filter(
    currency => 
      currency.code !== baseCurrency && 
      (currency.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
       currency.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // State to hold exchange rates
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({});

  // Fetch exchange rates when baseCurrency changes or currencies load
  useEffect(() => {
    const fetchRates = async () => {
      if (currencies.length === 0 || !baseCurrency) return;

      const newRates: {[key: string]: number} = {};
      
      try {
        setLoading(true);
        // Fetch rates for all currencies in parallel
        const promises = filteredCurrencies.map(async (currency) => {
          if (currency.code !== baseCurrency) {
            const rate = await getExchangeRate(baseCurrency, currency.code);
            newRates[currency.code] = rate;
          }
        });
        
        await Promise.all(promises);
        setExchangeRates(newRates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRates();
  }, [baseCurrency, currencies, filteredCurrencies]);

  // Prepare data for the table
  const tableData = filteredCurrencies
    .filter(currency => currency.code !== baseCurrency)
    .map(currency => {
      return {
        currency,
        rate: exchangeRates[currency.code] || 0
      };
    });

  // Sort the data
  const sortedData = [...tableData].sort((a, b) => {
    if (sortBy === 'code') {
      return sortDirection === 'asc' 
        ? a.currency.code.localeCompare(b.currency.code)
        : b.currency.code.localeCompare(a.currency.code);
    } else if (sortBy === 'name') {
      return sortDirection === 'asc'
        ? a.currency.name.localeCompare(b.currency.name)
        : b.currency.name.localeCompare(a.currency.name);
    } else {
      return sortDirection === 'asc' 
        ? a.rate - b.rate 
        : b.rate - a.rate;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Currency Market</h1>
        <p className="text-gray-600">
          View exchange rates for all currencies relative to your selected base currency
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="baseCurrency" className="block text-sm font-medium text-gray-700 mb-2">
              Base Currency
            </label>
            <select
              id="baseCurrency"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Currency
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name or code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-md p-4 mb-6">
          <p className="text-indigo-800">
            <span className="font-medium">Currency Market Information:</span> All rates are updated in real-time and
            represent the value of each currency relative to 1 {baseCurrency}.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-gray-600">Loading currencies...</span>
          </div>
        ) : (
          <CurrencyTable 
            data={sortedData} 
            baseCurrency={baseCurrency} 
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        )}
      </div>
    </div>
  );
}
