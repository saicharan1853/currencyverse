import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-white p-2 rounded-full">
                <div className="text-indigo-600 font-bold text-xl">CH</div>
              </div>
              <h1 className="ml-3 text-xl font-bold">CurrencyHub</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`font-medium hover:text-indigo-200 transition-colors ${
                isActive('/') ? 'border-b-2 border-white' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/wallet"
              className={`font-medium hover:text-indigo-200 transition-colors ${
                isActive('/wallet') ? 'border-b-2 border-white' : ''
              }`}
            >
              Wallets
            </Link>
            <Link
              to="/market"
              className={`font-medium hover:text-indigo-200 transition-colors ${
                isActive('/market') ? 'border-b-2 border-white' : ''
              }`}
            >
              Market
            </Link>
            <Link
              to="/exchange"
              className={`font-medium hover:text-indigo-200 transition-colors ${
                isActive('/exchange') ? 'border-b-2 border-white' : ''
              }`}
            >
              Exchange
            </Link>
            <Link
              to="/transactions"
              className={`font-medium hover:text-indigo-200 transition-colors ${
                isActive('/transactions') ? 'border-b-2 border-white' : ''
              }`}
            >
              Transactions
            </Link>
            {user?.isAdmin && (
              <Link
                to="/admin"
                className={`font-medium hover:text-indigo-200 transition-colors ${
                  isActive('/admin') ? 'border-b-2 border-white' : ''
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
          
          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="ml-2">{user?.name || 'User'}</span>
            </div>
            <button 
              className="flex items-center bg-indigo-700 hover:bg-indigo-900 transition-colors py-1 px-3 rounded"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span>Logout</span>
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`font-medium py-2 ${
                  isActive('/') ? 'bg-indigo-700 rounded px-2' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/wallet"
                className={`font-medium py-2 ${
                  isActive('/wallet') ? 'bg-indigo-700 rounded px-2' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Wallets
              </Link>
              <Link
                to="/market"
                className={`font-medium py-2 ${
                  isActive('/market') ? 'bg-indigo-700 rounded px-2' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Market
              </Link>
              <Link
                to="/exchange"
                className={`font-medium py-2 ${
                  isActive('/exchange') ? 'bg-indigo-700 rounded px-2' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Exchange
              </Link>
              <Link
                to="/transactions"
                className={`font-medium py-2 ${
                  isActive('/transactions') ? 'bg-indigo-700 rounded px-2' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Transactions
              </Link>
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className={`font-medium py-2 ${
                    isActive('/admin') ? 'bg-indigo-700 rounded px-2' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <div className="pt-2 border-t border-indigo-500">
                <div className="flex items-center py-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="ml-2">{user?.name || 'User'}</span>
                </div>
                <button 
                  className="flex items-center bg-indigo-700 hover:bg-indigo-900 transition-colors py-2 px-3 rounded w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
