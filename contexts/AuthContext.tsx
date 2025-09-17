// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService, { UserProfile } from '../services/authService';
import { User } from '../types';
import { StorageService } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated with backend
      const authenticated = await AuthService.isAuthenticated();
      
      if (authenticated) {
        // Get user profile from backend
        const profile = await AuthService.getCurrentUser();
        setUserProfile(profile);
        
        // Convert to local user format
        const localUser: User = {
          name: profile.full_name || 'User',
          email: '', // We don't get email from the profile endpoint
          phone: profile.phone || ''
        };
        
        // Try to get stored user data for email
        const storedUser = await StorageService.getUser();
        if (storedUser?.email) {
          localUser.email = storedUser.email;
        }
        
        setUser(localUser);
        setIsAuthenticated(true);
        
        // Update stored user data
        await StorageService.saveUser(localUser);
      } else {
        // Clear any stale data
        await StorageService.clearAllData();
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await StorageService.clearAllData();
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      
      if (response.success && response.user) {
        const profile = response.user;
        setUserProfile(profile);
        
        const localUser: User = {
          name: profile.full_name || 'User',
          email: email,
          phone: profile.phone || ''
        };
        
        setUser(localUser);
        setIsAuthenticated(true);
        await StorageService.saveUser(localUser);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
  }) => {
    try {
      const response = await AuthService.register(userData);
      
      if (response.success && response.user) {
        const profile = response.user;
        setUserProfile(profile);
        
        const localUser: User = {
          name: profile.full_name || userData.full_name || 'User',
          email: userData.email,
          phone: profile.phone || userData.phone || ''
        };
        
        setUser(localUser);
        setIsAuthenticated(true);
        await StorageService.saveUser(localUser);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      await StorageService.clearAllData();
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await AuthService.getCurrentUser();
      setUserProfile(profile);
      
      if (user) {
        const updatedUser: User = {
          ...user,
          name: profile.full_name || user.name,
          phone: profile.phone || user.phone
        };
        setUser(updatedUser);
        await StorageService.saveUser(updatedUser);
      }
    } catch (error) {
      console.error('Refresh user failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};