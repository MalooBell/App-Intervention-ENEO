import { create } from 'zustand';
import { Intervention } from '@/types';
import { apiService } from '@/services/api';

interface InterventionState {
  interventions: Intervention[];
  currentIntervention: Intervention | null;
  isLoading: boolean;
  error: string | null;
  fetchInterventions: (agentId: number) => Promise<void>;
  setCurrentIntervention: (intervention: Intervention | null) => void;
  resolveIntervention: (interventionId: number) => Promise<void>;
  clearError: () => void;
}

export const useInterventionStore = create<InterventionState>((set, get) => ({
  interventions: [],
  currentIntervention: null,
  isLoading: false,
  error: null,

  fetchInterventions: async (agentId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const interventions = await apiService.getAssignedInterventions(agentId);
      set({
        interventions,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: 'Impossible de récupérer les interventions',
      });
    }
  },

  setCurrentIntervention: (intervention: Intervention | null) => {
    set({ currentIntervention: intervention });
  },

  resolveIntervention: async (interventionId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiService.resolveIntervention(interventionId);
      
      const { interventions } = get();
      // MODIFICATION: Utilisation du statut 'RESOLU' du backend
      const updatedInterventions = interventions.map(intervention =>
        intervention.id === interventionId
          ? { ...intervention, status: 'RESOLU' as Intervention['status'] }
          : intervention
      );
      
      set({
        interventions: updatedInterventions,
        isLoading: false,
        currentIntervention: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: "Impossible de résoudre l'intervention",
      });
    }
  },

  clearError: () => set({ error: null }),
}));