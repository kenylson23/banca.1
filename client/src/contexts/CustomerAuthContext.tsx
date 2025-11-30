import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface CustomerInfo {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  loyaltyPoints: number;
  tier: string | null;
  totalSpent: string;
  visitCount: number;
}

interface LoyaltyInfo {
  isActive: boolean;
  pointsPerCurrency: string;
  currencyPerPoint: string;
  minPointsToRedeem: number;
}

interface CustomerAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  customer: CustomerInfo | null;
  loyalty: LoyaltyInfo | null;
  token: string | null;
  requestOtp: (phone: string, restaurantId: string) => Promise<{ success: boolean; customerId?: string; otpCode?: string; message?: string }>;
  verifyOtp: (phone: string, restaurantId: string, otpCode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'customer_auth_token';

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const checkAuth = useCallback(async (authToken: string) => {
    try {
      const response = await fetch('/api/public/customer-auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setCustomer(data.customer);
          setLoyalty(data.loyalty);
          setIsAuthenticated(true);
          setToken(authToken);
          return true;
        }
      }
      
      localStorage.removeItem(STORAGE_KEY);
      setIsAuthenticated(false);
      setCustomer(null);
      setLoyalty(null);
      setToken(null);
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem(STORAGE_KEY);
      setIsAuthenticated(false);
      setCustomer(null);
      setLoyalty(null);
      setToken(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY);
    if (storedToken) {
      checkAuth(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [checkAuth]);

  const requestOtp = async (phone: string, restaurantId: string) => {
    try {
      const response = await apiRequest('POST', '/api/public/customer-auth/request-otp', {
        phone,
        restaurantId,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Request OTP error:', error);
      return { success: false, message: 'Erro ao solicitar código' };
    }
  };

  const verifyOtp = async (phone: string, restaurantId: string, otpCode: string) => {
    try {
      const response = await apiRequest('POST', '/api/public/customer-auth/verify', {
        phone,
        restaurantId,
        otpCode,
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem(STORAGE_KEY, data.token);
        setToken(data.token);
        setCustomer(data.customer);
        setLoyalty(data.loyalty);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/public/customer-auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      setIsAuthenticated(false);
      setCustomer(null);
      setLoyalty(null);
      setToken(null);
    }
  };

  const refreshSession = async () => {
    if (!token) return false;
    
    try {
      const response = await fetch('/api/public/customer-auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return true;
      }
      
      await logout();
      return false;
    } catch (error) {
      console.error('Refresh session error:', error);
      await logout();
      return false;
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        customer,
        loyalty,
        token,
        requestOtp,
        verifyOtp,
        logout,
        refreshSession,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
