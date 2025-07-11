import { useAuth } from '../contexts/AuthContext';

export default function SimpleDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 mb-6">
          You have successfully logged in to CurrencyVerse.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">User Email</h3>
            <p className="text-blue-700">{user?.email}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Account Type</h3>
            <p className="text-green-700">{user?.isAdmin ? 'Admin' : 'Regular User'}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900">Wallets</h3>
            <p className="text-purple-700">{user?.wallets?.length || 0} wallets</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900">Member Since</h3>
            <p className="text-yellow-700">
              {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <a 
            href="/exchange" 
            className="block w-full bg-indigo-600 text-white text-center py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Currency Exchange
          </a>
          <a 
            href="/market" 
            className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            View Market
          </a>
          <a 
            href="/transactions" 
            className="block w-full bg-purple-600 text-white text-center py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Transaction History
          </a>
        </div>
      </div>
    </div>
  );
}
