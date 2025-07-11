import { useState, useEffect } from 'react';
import { ArrowUpDown, Calendar, CloudDownload, Filter } from 'lucide-react';
import TransactionItem from '../components/TransactionItem';
import {
  getUserTransactions,
  getAllCurrencies
} from '../services/currencyService';
import { Transaction, Currency } from '../types';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

export default function TransactionsPage() {
  // State variables
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  // Data state
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.id) return;
        
        setLoading(true);
        const [currenciesData, transactionsData] = await Promise.all([
          getAllCurrencies(),
          getUserTransactions(user.id)
        ]);
        setCurrencies(currenciesData);
        setAllTransactions(transactionsData);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  // Helpers to map currency codes
  const getCurrency = (code: string) =>
    currencies.find(c => c.code === code) || currencies[0];

  // Apply filters
  const filteredTransactions = allTransactions
    // Status filter
    .filter(tx => filter === 'all' || tx.status === filter)
    // Search term filter
    .filter(tx => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        tx.fromCurrency.toLowerCase().includes(term) ||
        tx.toCurrency.toLowerCase().includes(term) ||
        tx.id.toLowerCase().includes(term)
      );
    })
    // Date range filter
    .filter(tx => {
      if (dateRange.start && dateRange.end) {
        const d = parseISO(tx.date);
        return isWithinInterval(d, {
          start: parseISO(dateRange.start),
          end: parseISO(dateRange.end)
        });
      }
      return true;
    })
    // Sorting
    .sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  // Calculate stats
  const total = allTransactions.length;
  const counts = {
    completed: allTransactions.filter(tx => tx.status === 'completed').length,
    pending: allTransactions.filter(tx => tx.status === 'pending').length,
    failed: allTransactions.filter(tx => tx.status === 'failed').length
  };

  // Group by date
  const grouped = filteredTransactions.reduce((groups, tx) => {
    const date = format(parseISO(tx.date), 'MMM d, yyyy');
    (groups[date] = groups[date] || []).push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Export CSV
  const handleExport = () => {
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.fromCurrency,
      tx.toCurrency,
      tx.fromAmount,
      tx.toAmount,
      tx.status,
      tx.date
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,From,To,FromAmount,ToAmount,Status,Date', ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `transactions_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
          <p className="text-gray-600">
            View and track all your currency exchange transactions
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          {/* Date range picker */}
          <div className="flex items-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 px-4 rounded-md transition-colors">
            <Calendar className="w-4 h-4 mr-2" />
            <input
              type="date"
              value={dateRange.start}
              onChange={e =>
                setDateRange(prev => ({ ...prev, start: e.target.value }))
              }
              className="bg-transparent"
            />
            <span className="mx-2">–</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e =>
                setDateRange(prev => ({ ...prev, end: e.target.value }))
              }
              className="bg-transparent"
            />
          </div>
          {/* Export button */}
          <button
            className="flex items-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 px-4 rounded-md transition-colors"
            onClick={handleExport}
          >
            <CloudDownload className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={total} color="indigo" />
        <StatCard label="Completed" value={counts.completed} color="green" />
        <StatCard label="Pending" value={counts.pending} color="yellow" />
        <StatCard label="Failed" value={counts.failed} color="red" />
      </div>

      {/* Filter, sort, search */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between">
          <div className="relative w-full md:w-64 mb-3 md:mb-0">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Filter className="h-5 w-5" />
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <button
                className="flex items-center bg-white border rounded-md py-2 px-4 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                Filter
              </button>
              {/* Status filter menu */}
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1">
                  {(['all', 'completed', 'pending', 'failed'] as const).map(status => (
                    <button
                      key={status}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setFilter(status);
                        setShowFilterMenu(false);
                      }}
                    >
                      {status[0].toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="flex items-center bg-white border rounded-md py-2 px-4 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() =>
                setSortOrder(prev => (prev === 'newest' ? 'oldest' : 'newest'))
              }
            >
              <ArrowUpDown className="w-4 h-4 mr-2 text-gray-500" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>

        {/* Transaction list */}
        <div className="divide-y divide-gray-200">
          {Object.entries(grouped).length ? (
            Object.entries(grouped).map(([date, txs]) => (
              <div key={date}>
                <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                  {date}
                </div>
                <div className="p-4 space-y-4">
                  {txs.map(tx => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      fromCurrency={getCurrency(tx.fromCurrency)}
                      toCurrency={getCurrency(tx.toCurrency)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable card component for stats
function StatCard({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: 'indigo' | 'green' | 'yellow' | 'red';
}) {
  const colorMap: Record<string, string> = {
    indigo: 'border-indigo-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
    red: 'border-red-500'
  };
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${colorMap[color]}`}>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
