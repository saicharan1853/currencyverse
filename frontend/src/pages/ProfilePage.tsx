import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from '../types';
import { Briefcase, Calendar, Clock, Mail, User, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  // Set initial form values when user data is loaded
  useEffect(() => {
    if (user) {
      setEditedName(user.name);
      setEditedEmail(user.email);
      setWallets(user.wallets || []);
      
      // Calculate total balance across all wallets
      const total = user.wallets?.reduce((sum: number, wallet: Wallet) => 
        sum + wallet.balance, 0) || 0;
      setTotalBalance(total);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // In a real app, you would call an API to update the profile
      // await updateUserProfile(user.id, editedName, editedEmail);
      
      // For demo purposes, we'll just simulate a successful update
      console.log('Profile updated:', { name: editedName, email: editedEmail });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      <div className="bg-indigo-700 rounded-lg shadow-lg p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white rounded-full p-3 mr-4">
              <User className="h-12 w-12 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name || 'User'}</h1>
              <div className="flex items-center mt-1">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user?.email || 'email@example.com'}</span>
              </div>
              <div className="flex items-center mt-1">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>{user?.isAdmin ? 'Administrator' : 'Regular User'}</span>
              </div>
            </div>
          </div>
          <div className="md:text-right">
            <div className="text-3xl font-bold">${totalBalance.toFixed(2)}</div>
            <div className="text-indigo-200 text-sm">Across {wallets.length} wallets</div>
            <button
              onClick={handleLogout}
              className="mt-4 inline-flex items-center bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            </div>
            <nav className="space-y-1 p-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'profile' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'security' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'preferences' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Preferences
              </button>
            </nav>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {activeTab === 'profile' && (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="space-x-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      <div className="mt-1 text-gray-900">
                        {user?.name || 'User'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-400" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        id="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      <div className="mt-1 text-gray-900">
                        {user?.email || 'email@example.com'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Date Joined
                    </label>
                    <div className="mt-1 text-gray-900">
                      {user?.joinDate ? format(new Date(user.joinDate), 'MMMM d, yyyy') : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Last Active
                    </label>
                    <div className="mt-1 text-gray-900">
                      {user?.lastActive ? format(new Date(user.lastActive), 'MMMM d, yyyy') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Change Password</h4>
                    <div className="mt-2 space-y-3">
                      <div>
                        <label htmlFor="current-password" className="sr-only">Current Password</label>
                        <input
                          type="password"
                          id="current-password"
                          placeholder="Current Password"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-password" className="sr-only">New Password</label>
                        <input
                          type="password"
                          id="new-password"
                          placeholder="New Password"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="sr-only">Confirm New Password</label>
                        <input
                          type="password"
                          id="confirm-password"
                          placeholder="Confirm New Password"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h4>
                    <div className="mt-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        Enable Two-Factor Authentication
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'preferences' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Language</h4>
                    <select className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Time Zone</h4>
                    <select className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                      <option>(UTC-08:00) Pacific Time</option>
                      <option>(UTC-07:00) Mountain Time</option>
                      <option>(UTC-06:00) Central Time</option>
                      <option>(UTC-05:00) Eastern Time</option>
                      <option>(UTC+00:00) UTC</option>
                      <option>(UTC+01:00) Central European Time</option>
                    </select>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Default Currency</h4>
                    <select className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                      <option>JPY - Japanese Yen</option>
                      <option>CNY - Chinese Yuan</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="email-notifications"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                      Receive email notifications
                    </label>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
