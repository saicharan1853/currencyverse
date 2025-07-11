import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Checking authentication status...');
        // Check if we have saved user info in localStorage
        const savedEmail = localStorage.getItem('userEmail');
        console.log('📧 Saved email from localStorage:', savedEmail);
        
        if (savedEmail) {
          // Try to authenticate with the saved email
          console.log('🔐 Attempting to restore session for:', savedEmail);
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/me?email=${encodeURIComponent(savedEmail)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          const data = await response.json();
          console.log('🔐 Auth check response:', { status: response.status, success: data.success });
          
          if (response.ok && data.success) {
            console.log('✅ Authentication successful, setting user:', data.data.email);
            setUser(data.data);
            setIsAuthenticated(true);
          } else {
            console.log('❌ Authentication failed, clearing stored credentials');
            // Clear invalid stored credentials
            localStorage.removeItem('userEmail');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('📭 No saved email found in localStorage');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('💥 Authentication check failed:', error);
        localStorage.removeItem('userEmail');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        console.log('🏁 Auth check complete, setting loading to false');
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log(`🚀 Attempting to log in with email: ${email}`);
      console.log(`📡 API URL: ${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/login`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log(`📊 Login response:`, { status: response.status, data });
      
      if (response.ok && data.success) {
        // Save user data
        console.log('✅ Login successful, setting user data:', data.data);
        setUser(data.data);
        setIsAuthenticated(true);
        
        // Save email to localStorage for persistent login
        localStorage.setItem('userEmail', email);
        console.log('💾 Saved email to localStorage:', email);
        
        console.log("🎉 Login successful for:", data.data.name);
        return true;
      } else {
        console.error("❌ Login failed:", data.message || "Authentication failed");
        localStorage.removeItem('userEmail');
        return false;
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      console.log('🚪 Starting logout process...');
      
      // Clear localStorage first
      const savedEmail = localStorage.getItem('userEmail');
      console.log('📧 Clearing saved email from localStorage:', savedEmail);
      localStorage.removeItem('userEmail');
      
      // Call the logout endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/logout`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('🔐 Logout response:', response.status);
      
      // Always clear local state
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful - user state cleared');
    } catch (error) {
      console.error('💥 Logout error:', error);
      // Still clear state even on API error
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    console.log("Starting registration for:", email);
    try {
      // Use direct fetch for better error handling
      console.log("Sending registration request to:", `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/register`);
      const requestBody = {
        name,
        email,
        password
      };
      console.log("Request body:", JSON.stringify(requestBody));
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });
      
      console.log("Registration response status:", response.status);
      const data = await response.json();
      console.log("Registration response data:", data);
      
      if (response.ok && data.success) {
        console.log("Registration successful, setting user:", data.data);
        setUser(data.data);
        setIsAuthenticated(true);
        // Save email to localStorage for persistent login
        localStorage.setItem('userEmail', email);
        return true;
      } else {
        console.error("Registration failed:", data.message);
        const errorMessage = data.message || "Unknown error";
        console.error(`Registration failed: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
