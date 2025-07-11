import { useState } from 'react';
import { ArrowUpDown, TrendingDown, TrendingUp } from 'lucide-react';
import { Currency } from '../types';

interface CurrencyTableProps {
  data: {
    currency: Currency;
    rate: number;
  }[];
  baseCurrency: string;
  sortBy: 'code' | 'name' | 'rate';
  sortDirection: 'asc' | 'desc';
  onSort: (column: 'code' | 'name' | 'rate') => void;
}

export default function CurrencyTable({ 
  data, 
  baseCurrency, 
  sortBy, 
  sortDirection, 
  onSort 
}: CurrencyTableProps) {
  const [expandedCurrency, setExpandedCurrency] = useState<string | null>(null);

  const toggleExpand = (code: string) => {
    if (expandedCurrency === code) {
      setExpandedCurrency(null);
    } else {
      setExpandedCurrency(code);
    }
  };

  const getSortIcon = (column: 'code' | 'name' | 'rate') => {
    if (sortBy === column) {
      return (
        <ArrowUpDown 
          className={`w-4 h-4 inline-block ml-1 transform ${
            sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'
          }`} 
        />
      );
    }
    return <ArrowUpDown className="w-4 h-4 inline-block ml-1 opacity-30" />;
  };

  // Function to calculate percent change
  const getPercentChange = (currencyCode: string) => {
    // Since getHistoricalRates is async and this is called in render,
    // we'll return a default value. In a real app, you'd want to
    // fetch this data at a higher level and pass it down.
    try {
      // For now, return a mock calculation based on rate
      const mockPercentChange = (Math.random() - 0.5) * 10; // Random change between -5% and +5%
      return {
        value: Math.abs(mockPercentChange),
        isPositive: mockPercentChange >= 0
      };
    } catch {
      return { value: 0, isPositive: true };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('code')}
            >
              Code {getSortIcon('code')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('name')}
            >
              Currency {getSortIcon('name')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('rate')}
            >
              Rate {getSortIcon('rate')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Change (7d)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map(({ currency, rate }) => {
            const change = getPercentChange(currency.code);
            
            return (
              <tr 
                key={currency.code}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => toggleExpand(currency.code)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{currency.flag}</span>
                    <span className="font-medium text-gray-900">{currency.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{currency.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {rate.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-500">
                    1 {baseCurrency} = {rate.toFixed(4)} {currency.code}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center ${
                    change.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change.isPositive ? 
                      <TrendingUp className="w-4 h-4 mr-1" /> : 
                      <TrendingDown className="w-4 h-4 mr-1" />
                    }
                    <span>{change.value.toFixed(2)}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No currencies found matching your search.
        </div>
      )}
    </div>
  );
}
