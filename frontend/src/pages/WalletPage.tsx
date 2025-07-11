import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpDown, CreditCard, PieChart, Plus, X, Minus, AlertCircle } from 'lucide-react';
import WalletCard from '../components/WalletCard';
import { getAllCurrencies, getUserWallets } from '../services/currencyService';
import { Currency, Wallet } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function WalletPage() {
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [walletView, setWalletView] = useState<'grid' | 'list'>('grid');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bankTransfer');
  const [bankAccount, setBankAccount] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [withdrawalError, setWithdrawalError] = useState('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [, setLoading] = useState(true);
  
  // Get the authenticated user
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch currencies and wallets
        const currenciesData = await getAllCurrencies();
        setCurrencies(currenciesData);
        
        if (user?.id) {
          const walletsData = await getUserWallets(user.id);
          setWallets(walletsData);
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);
  
  const handleAddFunds = (wallet: { currencyCode: string }) => {
    setSelectedWallet(wallet.currencyCode);
    setShowAddFundsModal(true);
  };
  
  const handleWithdraw = (wallet?: { currencyCode: string }) => {
    if (wallet) {
      setSelectedWallet(wallet.currencyCode);
    } else {
      // If no specific wallet is provided, default to first wallet
      setSelectedWallet(wallets[0]?.currencyCode || null);
    }
    setShowWithdrawModal(true);
    setWithdrawalError('');
    setAmount('');
    setBankAccount('');
    setRoutingNumber('');
  };
  
  const handleAddFundsSubmit = () => {
    // This would typically interact with a payment processor in a real app
    setShowAddFundsModal(false);
    setAmount('');
  };
  
  const handleWithdrawSubmit = () => {
    setWithdrawalError('');
    
    // Validation
    const withdrawAmount = parseFloat(amount);
    const selectedWalletData = wallets.find((w: Wallet) => w.currencyCode === selectedWallet);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      setWithdrawalError('Please enter a valid amount');
      return;
    }
    
    if (!selectedWalletData) {
      setWithdrawalError('Wallet not found');
      return;
    }
    
    if (withdrawAmount > selectedWalletData.balance) {
      setWithdrawalError('Insufficient funds. Available balance: ' + 
        selectedWalletData.balance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }));
      return;
    }
    
    // Minimum withdrawal validation
    const minWithdrawal = 10;
    if (withdrawAmount < minWithdrawal) {
      setWithdrawalError(`Minimum withdrawal amount is ${minWithdrawal}`);
      return;
    }
    
    // Bank account validation for bank transfers
    if (withdrawalMethod === 'bankTransfer') {
      if (!bankAccount || bankAccount.length < 8) {
        setWithdrawalError('Please enter a valid bank account number');
        return;
      }
      if (!routingNumber || routingNumber.length !== 9) {
        setWithdrawalError('Please enter a valid 9-digit routing number');
        return;
      }
    }
    
    // This would typically interact with a payment processor in a real app
    console.log('Withdrawal request:', {
      amount: withdrawAmount,
      currency: selectedWallet,
      method: withdrawalMethod,
      bankAccount: withdrawalMethod === 'bankTransfer' ? bankAccount : null,
      routingNumber: withdrawalMethod === 'bankTransfer' ? routingNumber : null
    });
    
    setShowWithdrawModal(false);
    setAmount('');
    setBankAccount('');
    setRoutingNumber('');
  };
  
  // Calculate total balance in USD equivalent (simplified conversion)
  const calculateTotalBalance = () => {
    let total = 0;
    wallets.forEach((wallet: Wallet) => {
      // Simple conversion rate lookup would be more complex in a real app
      const conversionRate = wallet.currencyCode === 'USD' ? 1 : 
                            wallet.currencyCode === 'EUR' ? 1.09 : 
                            wallet.currencyCode === 'GBP' ? 1.28 : 0.75;
      total += wallet.balance * conversionRate;
    });
    return total.toFixed(2);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Wallets</h1>
        <p className="text-gray-600">Manage your currency wallets and track your global assets</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <WalletIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Balance (USD Equivalent)</h2>
              <p className="text-2xl font-bold text-gray-900">${calculateTotalBalance()}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setWalletView('grid')}
              className={`px-3 py-2 rounded-md flex items-center ${
                walletView === 'grid' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Grid View
            </button>
            <button
              onClick={() => setWalletView('list')}
              className={`px-3 py-2 rounded-md flex items-center ${
                walletView === 'list' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              List View
            </button>
            <button
              className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 flex items-center"
              onClick={() => {
                if (wallets.length > 0) {
                  handleAddFunds(wallets[0]);
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </button>
            <button
              className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center"
              onClick={() => handleWithdraw()}
            >
              <Minus className="w-4 h-4 mr-2" />
              Withdraw
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Your Wallets ({wallets.length})</h2>
          <button className="flex items-center text-indigo-600 hover:text-indigo-800">
            <PieChart className="w-4 h-4 mr-1" />
            Portfolio Analysis
          </button>
        </div>
        
        {walletView === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet: Wallet) => (
              <WalletCard 
                key={wallet.id} 
                wallet={wallet} 
                onAddFunds={handleAddFunds}
                onWithdraw={handleWithdraw}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available Balance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    USD Equivalent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wallets.map((wallet: Wallet) => {
                  const currency = currencies.find((c: Currency) => c.code === wallet.currencyCode);
                  if (!currency) return null;
                  
                  // Simple conversion rate
                  const conversionRate = wallet.currencyCode === 'USD' ? 1 : 
                                        wallet.currencyCode === 'EUR' ? 1.09 : 
                                        wallet.currencyCode === 'GBP' ? 1.28 : 0.75;
                  const usdEquivalent = wallet.balance * conversionRate;
                  
                  return (
                    <tr key={wallet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                            {currency.flag}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{currency.name}</div>
                            <div className="text-sm text-gray-500">{currency.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {currency.symbol} {wallet.balance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${usdEquivalent.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(wallet.lastUpdated).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleAddFunds(wallet)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Add Funds
                        </button>
                        <button
                          onClick={() => handleWithdraw(wallet)}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          Withdraw
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          History
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-indigo-800 mb-4">Wallet Management Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <h3 className="font-medium text-indigo-700 mb-2">Diversify Your Portfolio</h3>
            <p className="text-sm text-gray-600">
              Spread your assets across multiple currencies to reduce risk from exchange rate fluctuations.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <h3 className="font-medium text-indigo-700 mb-2">Monitor Exchange Rates</h3>
            <p className="text-sm text-gray-600">
              Keep an eye on currency trends to find the best time to exchange between your wallets.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <h3 className="font-medium text-indigo-700 mb-2">Set Up Rate Alerts</h3>
            <p className="text-sm text-gray-600">
              Create notifications for favorable exchange rates to optimize your currency conversions.
            </p>
          </div>
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
      
        {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Withdraw Funds
              </h3>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Currency Selection */}
            <div className="mb-4">
              <label htmlFor="withdrawCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                Select Currency
              </label>
              <select
                id="withdrawCurrency"
                name="withdrawCurrency"
                value={selectedWallet || ''}
                onChange={(e) => setSelectedWallet(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                {wallets.map((wallet: Wallet) => {
                  const currency = currencies.find((c: Currency) => c.code === wallet.currencyCode);
                  return (
                    <option key={wallet.id} value={wallet.currencyCode}>
                      {currency?.flag} {currency?.name} ({currency?.code}) - {currency?.symbol}{wallet.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </option>
                  );
                })}
              </select>
            </div>
            
            {/* Available Balance Info */}
            {selectedWallet && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Balance:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currencies.find(c => c.code === selectedWallet)?.symbol} {
                      wallets.find((w: Wallet) => w.currencyCode === selectedWallet)?.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                    }
                  </span>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Withdrawal Amount
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {currencies.find(c => c.code === selectedWallet)?.symbol}
                  </span>
                </div>
                <input
                  type="text"
                  name="withdrawAmount"
                  id="withdrawAmount"
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">{selectedWallet}</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum withdrawal: 10.00</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="withdrawalMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Withdrawal Method
              </label>
              <select
                id="withdrawalMethod"
                name="withdrawalMethod"
                value={withdrawalMethod}
                onChange={(e) => setWithdrawalMethod(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="bankTransfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="check">Check</option>
              </select>
            </div>
            
            {/* Bank Transfer Fields */}
            {withdrawalMethod === 'bankTransfer' && (
              <>
                <div className="mb-4">
                  <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    id="bankAccount"
                    className="focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md py-3"
                    placeholder="Enter your bank account number"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    name="routingNumber"
                    id="routingNumber"
                    className="focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md py-3"
                    placeholder="9-digit routing number"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    maxLength={9}
                  />
                </div>
              </>
            )}
            
            {/* Error Message */}
            {withdrawalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{withdrawalError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Processing Time Info */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800">
                <strong>Processing Time:</strong> Bank transfers typically take 1-3 business days. 
                PayPal withdrawals are usually instant. Check withdrawals take 5-7 business days.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawSubmit}
                disabled={!selectedWallet}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Withdraw Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}