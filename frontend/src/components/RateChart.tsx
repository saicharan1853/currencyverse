import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { getHistoricalRates } from '../services/currencyService';
import { HistoricalRate } from '../types';

interface RateChartProps {
  fromCurrency: string;
  toCurrency: string;
}

export default function RateChart({ fromCurrency, toCurrency }: RateChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [historicalData, setHistoricalData] = useState<HistoricalRate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getHistoricalRates(fromCurrency, toCurrency, days);
        setHistoricalData(data);
      } catch (error) {
        console.error('Error fetching historical rates:', error);
        setHistoricalData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fromCurrency, toCurrency, days]);
  
  // Format data for recharts
  const chartData = historicalData.map(item => ({
    date: item.date,
    rate: item.rate
  }));
  
  const minRate = historicalData.length > 0 ? Math.min(...historicalData.map(d => d.rate)) : 0;
  const maxRate = historicalData.length > 0 ? Math.max(...historicalData.map(d => d.rate)) : 1;
  const yDomain = [minRate * 0.99, maxRate * 1.01]; // Add a small padding
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {fromCurrency}/{toCurrency} Exchange Rate History
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === '7d' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === '30d' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === '90d' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            90D
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600">Loading chart data...</span>
        </div>
      ) : historicalData.length === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No historical data available</p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis 
                domain={yDomain}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toFixed(4)}
              />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(4), 'Rate']}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return d.toLocaleDateString();
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name={`${fromCurrency}/${toCurrency} Rate`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
