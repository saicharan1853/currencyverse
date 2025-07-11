import { format } from 'date-fns';
import { ArrowRight, CircleCheck, Clock, CircleX } from 'lucide-react';
import { Transaction, Currency } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
  fromCurrency: Currency;
  toCurrency: Currency;
}

export default function TransactionItem({ transaction, fromCurrency, toCurrency }: TransactionItemProps) {
  const statusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CircleCheck className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <CircleX className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const statusClass = () => {
    switch (transaction.status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row justify-between mb-2">
        <div className="flex items-center">
          <div className="text-xl mr-1">{fromCurrency.flag}</div>
          <span className="font-medium text-gray-800">
            {fromCurrency.symbol}{transaction.fromAmount.toFixed(2)} {fromCurrency.code}
          </span>
          <ArrowRight className="mx-2 text-gray-400" size={16} />
          <div className="text-xl mr-1">{toCurrency.flag}</div>
          <span className="font-medium text-gray-800">
            {toCurrency.symbol}{transaction.toAmount.toFixed(2)} {toCurrency.code}
          </span>
        </div>
        <div className="mt-2 md:mt-0">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass()}`}>
            {statusIcon()}
            <span className="ml-1 capitalize">{transaction.status}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500 mt-1">
        <div>
          Transaction ID: <span className="font-mono">{transaction.id}</span>
        </div>
        <div>
          {format(new Date(transaction.date), 'MMM d, yyyy h:mm a')}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Exchange Rate:</span>
          <span className="font-medium">
            1 {fromCurrency.code} = {transaction.rate.toFixed(4)} {toCurrency.code}
          </span>
        </div>
      </div>
    </div>
  );
}
