import { useState, useEffect } from 'react';
import { BarChart4, ChevronRight, CreditCard, ExternalLink, Settings, Users } from 'lucide-react';
import AdminUserTable from '../components/AdminUserTable';
import AdminTransactionTable from '../components/AdminTransactionTable';
import { getAllUsers, getAllTransactions } from '../services/currencyService';
import { User, Transaction } from '../types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'rates' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await getAllUsers();
        const transactionData = await getAllTransactions();
        setUsers(userData);
        setTransactions(transactionData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600">Loading data...</span>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'users':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">User Management</h2>
              <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>
            <AdminUserTable users={users} />
          </div>
        );
      case 'transactions':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
              <p className="text-gray-600">Monitor and manage all system transactions</p>
            </div>
            <AdminTransactionTable transactions={transactions} />
          </div>
        );
      case 'rates':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Exchange Rate Management</h2>
              <p className="text-gray-600">Configure exchange rates and provider settings</p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    This is a demo admin interface. In a production environment, this would connect to real exchange rate providers.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                <li>
                  <a href="#" className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          Exchange Rate Provider API
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Last synced 10 minutes ago
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <ExternalLink className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>
                            View API settings
                          </p>
                          <ChevronRight className="ml-1 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#" className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          Rate Update Schedule
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Every 15 minutes
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Next update in 5 minutes
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Settings className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>
                            Configure schedule
                          </p>
                          <ChevronRight className="ml-1 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#" className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          Manual Rate Adjustment
                        </p>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Override automatic rates for specific currency pairs
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <ChevronRight className="ml-1 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">System Settings</h2>
              <p className="text-gray-600">Configure global system settings and preferences</p>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Application Settings
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure global application behavior and defaults.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Default Currency
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      USD
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Exchange Fee
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      0.5%
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      User Registration
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      Open
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Maintenance Mode
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      Off
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Email Notifications
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      Enabled
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">System management and configuration</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          className={`p-6 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
            activeTab === 'users' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white text-gray-800 hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <div className="flex items-center">
            <Users className={`h-6 w-6 ${activeTab === 'users' ? 'text-white' : 'text-indigo-600'}`} />
            <h2 className="ml-3 text-lg font-semibold">Users</h2>
          </div>
          <p className={`mt-2 text-sm ${activeTab === 'users' ? 'text-indigo-100' : 'text-gray-500'}`}>
            Manage user accounts
          </p>
          <div className="mt-4 text-2xl font-bold">{users.length}</div>
        </div>
        
        <div 
          className={`p-6 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
            activeTab === 'transactions' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white text-gray-800 hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          <div className="flex items-center">
            <CreditCard className={`h-6 w-6 ${activeTab === 'transactions' ? 'text-white' : 'text-indigo-600'}`} />
            <h2 className="ml-3 text-lg font-semibold">Transactions</h2>
          </div>
          <p className={`mt-2 text-sm ${activeTab === 'transactions' ? 'text-indigo-100' : 'text-gray-500'}`}>
            View all transactions
          </p>
          <div className="mt-4 text-2xl font-bold">{transactions.length}</div>
        </div>
        
        <div 
          className={`p-6 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
            activeTab === 'rates' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white text-gray-800 hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('rates')}
        >
          <div className="flex items-center">
            <BarChart4 className={`h-6 w-6 ${activeTab === 'rates' ? 'text-white' : 'text-indigo-600'}`} />
            <h2 className="ml-3 text-lg font-semibold">Exchange Rates</h2>
          </div>
          <p className={`mt-2 text-sm ${activeTab === 'rates' ? 'text-indigo-100' : 'text-gray-500'}`}>
            Manage currency rates
          </p>
          <div className="mt-4 text-2xl font-bold">90+</div>
        </div>
        
        <div 
          className={`p-6 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
            activeTab === 'settings' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white text-gray-800 hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <div className="flex items-center">
            <Settings className={`h-6 w-6 ${activeTab === 'settings' ? 'text-white' : 'text-indigo-600'}`} />
            <h2 className="ml-3 text-lg font-semibold">Settings</h2>
          </div>
          <p className={`mt-2 text-sm ${activeTab === 'settings' ? 'text-indigo-100' : 'text-gray-500'}`}>
            System configuration
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
