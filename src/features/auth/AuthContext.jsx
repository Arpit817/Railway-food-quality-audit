import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase.js';

/**
 * Initial Staff Accounts for Indian Railways Food Quality & Safety Administration
 */
export const INITIAL_STAFF_ACCOUNTS = [
  {
    id: 'user-insp-01',
    name: 'Inspector Ramesh Sharma',
    email: 'inspector.nr@railfood.gov.in',
    password: 'Railway@2026',
    role: 'inspector',
    zone: 'Northern Zone',
    badgeId: 'NR-FSO-884'
  },
  {
    id: 'user-vendor-01',
    name: 'Express Caterers (Pantry Licensee)',
    email: 'vendor.express@railfood.gov.in',
    password: 'Vendor@2026',
    role: 'vendor',
    zone: 'Northern Zone',
    badgeId: 'RR-CAT-2024-001'
  },
  {
    id: 'user-admin-01',
    name: 'Director Neha Gupta',
    email: 'admin.safety@railfood.gov.in',
    password: 'AdminHQ@2026',
    role: 'admin',
    zone: 'All India HQ',
    badgeId: 'HQ-DIR-019'
  }
];

export const MOCK_USERS = INITIAL_STAFF_ACCOUNTS;

const ACCOUNTS_STORAGE_KEY = 'railfood_staff_accounts_registry';
const CURRENT_USER_KEY = 'railfood_auth_current_user';

function getStoredStaffAccounts() {
  try {
    const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_STAFF_ACCOUNTS));
      return INITIAL_STAFF_ACCOUNTS;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_STAFF_ACCOUNTS;
  } catch {
    return INITIAL_STAFF_ACCOUNTS;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      // Only restore session if explicitly saved — never auto-login
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const loginWithCredentials = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Try Supabase staff_accounts table first (cross-device auth)
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('staff_accounts')
          .select('*')
          .eq('email', cleanEmail)
          .eq('password', cleanPass)
          .maybeSingle();
        if (!error && data) {
          const userPayload = { ...data };
          delete userPayload.password;
          setCurrentUser(userPayload);
          return { success: true, user: userPayload };
        }
      } catch (err) {
        console.warn('Supabase auth failed, falling back to local accounts:', err);
      }
    }

    // 2. Fallback: local accounts (works offline / no Supabase)
    const accounts = getStoredStaffAccounts();
    const found = accounts.find(
      (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === cleanPass
    );

    if (found) {
      // Auto-sync to Supabase so cross-device login works immediately
      if (isSupabaseConfigured() && supabase) {
        supabase.from('staff_accounts').upsert([found]).then(() => {}).catch(() => {});
      }
      const userPayload = { ...found };
      delete userPayload.password;
      setCurrentUser(userPayload);
      return { success: true, user: userPayload };
    }

    return {
      success: false,
      error: 'Invalid Railway Email or Security Password. Please check your credentials.'
    };
  };

  const registerStaff = async ({ name, email, password, role = 'inspector', zone = 'Northern Zone', badgeId }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, error: 'All fields are mandatory.' };
    }

    const accounts = getStoredStaffAccounts();
    const exists = accounts.some((acc) => acc.email.toLowerCase() === cleanEmail);

    if (exists) {
      return { success: false, error: 'A staff account with this Railway email already exists.' };
    }

    const newStaff = {
      id: `user-${role}-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role,
      zone: zone || 'Northern Zone',
      badgeId: badgeId || `RAIL-${Math.floor(1000 + Math.random() * 9000)}`
    };

    // Try saving to Supabase staff_accounts for cross-device access
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('staff_accounts').insert([newStaff]);
      } catch (err) {
        console.warn('Supabase staff registration failed, saving locally:', err);
      }
    }

    const updated = [...accounts, newStaff];
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }

    const userPayload = { ...newStaff };
    delete userPayload.password;
    setCurrentUser(userPayload);
    return { success: true, user: userPayload };
  };

  const login = (role = 'inspector') => {
    const accounts = getStoredStaffAccounts();
    const user = accounts.find((u) => u.role === role) || accounts[0];
    const userPayload = { ...user };
    delete userPayload.password;
    setCurrentUser(userPayload);
    return userPayload;
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
        loginWithCredentials,
        registerStaff,
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

export default AuthContext;
