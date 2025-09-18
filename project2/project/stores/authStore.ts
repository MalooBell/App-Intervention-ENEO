import { create } from 'zustand';
import { Agent } from '@/types';
import { apiService } from '@/services/api';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  agent: Agent | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (matricule: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  agent: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (matricule: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.login(matricule, password);
      const { token, agent } = response;
      
      // Stocker le token de manière sécurisée
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('agent_data', JSON.stringify(agent));
      
      apiService.setToken(token);
      
      set({
        agent: agent,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: 'Identifiants incorrects. Veuillez réessayer.',
      });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('agent_data');
    
    set({
      agent: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));