import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import DashboardPage from './pages/DashboardPage';
import ExchangePage from './pages/ExchangePage';
import TransactionsPage from './pages/TransactionsPage';
import WalletPage from './pages/WalletPage';
import MarketPage from './pages/MarketPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

// ProtectedRoute component to handle route protection
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  console.log('🛡️ ProtectedRoute check:', { isAuthenticated, loading, user: user?.email });
  
  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  console.log('✅ ProtectedRoute: Authenticated, rendering children');
  return <>{children}</>;
};

// AdminRoute component to handle admin-only routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export function App() {
  useEffect(() => {
    // Add Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="flex-grow">
                    <DashboardPage />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/exchange" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="flex-grow">
                    <ExchangePage />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/market" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="flex-grow">
                    <MarketPage />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="flex-grow">
                    <TransactionsPage />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/wallet" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="flex-grow">
                    <WalletPage />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <AdminRoute>
                <>
                  <Header />
                  <main className="flex-grow">
                    <AdminPage />
                  </main>
                  <Footer />
                </>
              </AdminRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
