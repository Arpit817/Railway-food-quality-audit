import { create } from 'zustand';

/**
 * Zustand Global UI Store
 * Demonstrates:
 * - Lightweight global state management without Context boilerplate
 * - Selectors for optimized subscriptions
 * - Managing UI preferences, alerts, and sidebar collapse state
 */
export const useUIStore = create((set) => ({
  // Sidebar state
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Theme preference ('railway-dark' | 'railway-light')
  theme: 'railway-light',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'railway-light' ? 'railway-dark' : 'railway-light'
  })),

  // Global Toast notification state
  activeToast: null,
  showToast: (toast) => set({ activeToast: toast }),
  clearToast: () => set({ activeToast: null }),

  // High Severity Alert Trigger Rule state
  // Business Rule: Flag when 3+ hygiene complaints originate from the same kitchen within a 2-hour window
  activeKitchenAlerts: [],
  setKitchenAlerts: (alerts) => set({ activeKitchenAlerts: alerts })
}));
