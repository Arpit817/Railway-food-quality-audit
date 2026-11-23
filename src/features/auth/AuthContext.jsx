import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Mock Users Dataset representing role-based authorization in Indian Railways
 */
export const MOCK_USERS = [
  {
    id: 'user-insp-01',
    name: 'Inspector Ramesh Sharma',
    email: 'inspector.nr@railfood.gov.in',
    role: 'inspector', // 'passenger' | 'inspector' | 'admin'
    zone: 'Northern',
    token: 'mock-jwt-inspector-token'
  },
  {
    id: 'user-admin-01',
    name: 'Director Neha Gupta',
    email: 'admin.safety@railfood.gov.in',
    role: 'admin',
    zone: 'All India',
    token: 'mock-jwt-admin-token'
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage or default to logged-in inspector for university demo convenience
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('railfood_auth_user');
      return saved ? JSON.parse(saved) : MOCK_USERS[0];
    } catch (e) {
      return MOCK_USERS[0];
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('railfood_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('railfood_auth_user');
    }
  }, [currentUser]);

  const login = (role = 'inspector') => {
    const user = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        role: currentUser?.role || 'passenger',
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
