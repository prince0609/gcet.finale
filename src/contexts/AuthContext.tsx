import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User & { password: string }> = {
  'customer@demo.com': {
    id: 'cust-1',
    name: 'Rahul Sharma',
    email: 'customer@demo.com',
    companyName: 'XYZ Events Pvt Ltd',
    gstin: '27ABCDE1234F1Z5',
    role: 'customer',
    phone: '9876543210',
    password: 'demo123',
    createdAt: new Date(),
  },
  'vendor@demo.com': {
    id: 'vend-1',
    name: 'Amit Patel',
    email: 'vendor@demo.com',
    companyName: 'ABC Rentals',
    gstin: '24PQRST5678G2H3',
    role: 'vendor',
    phone: '9876543211',
    password: 'demo123',
    createdAt: new Date(),
  },
  'admin@demo.com': {
    id: 'admin-1',
    name: 'System Admin',
    email: 'admin@demo.com',
    companyName: 'RentEase Platform',
    gstin: '24ADMIN0000A1A1',
    role: 'admin',
    phone: '9876543212',
    password: 'demo123',
    createdAt: new Date(),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    const mockUser = mockUsers[email.toLowerCase()];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const signup = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    // Simulate signup - in real app would call API
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      companyName: userData.companyName || '',
      gstin: userData.gstin || '',
      role: 'customer',
      createdAt: new Date(),
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, switchRole }}>
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
