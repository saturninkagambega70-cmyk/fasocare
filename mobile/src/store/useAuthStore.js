import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

const secureStorage = {
  getItem: async (name) => await SecureStore.getItemAsync(name),
  setItem: async (name, value) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name) => await SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      offlineQueue: [], // File d'attente pour la synchronisation hors-ligne
      isPharmacyOpen: false, // Broadcast status pour Koudougou
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      togglePharmacy: () => set((state) => ({ isPharmacyOpen: !state.isPharmacyOpen })),
      logout: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false, offlineQueue: [] }),
      addToQueue: (action) => set((state) => ({ offlineQueue: [...state.offlineQueue, action] })),
      clearQueue: () => set({ offlineQueue: [] })
    }),
    {
      name: 'auth-storage-secure',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
