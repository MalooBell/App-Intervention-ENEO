import { create } from 'zustand';
import { Intervention, Agent, Message } from '../types';

interface AppStore {
  // Data
  interventions: Intervention[];
  agents: Agent[];
  messages: Message[];

  // UI State
  selectedIntervention: Intervention | null;
  isInterventionModalOpen: boolean;
  isTeamAssignmentModalOpen: boolean;
  activeTab: 'interventions' | 'agents';
  interventionModalTab: 'details' | 'chat';
  sidebarOpen: boolean;

  // Filter state
  statusFilter: string;

  // Actions
  setInterventions: (interventions: Intervention[]) => void;
  setAgents: (agents: Agent[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  setSelectedIntervention: (intervention: Intervention | null) => void;
  setInterventionModalOpen: (open: boolean) => void;
  setTeamAssignmentModalOpen: (open: boolean) => void;
  setActiveTab: (tab: 'interventions' | 'agents') => void;
  setInterventionModalTab: (tab: 'details' | 'chat') => void;
  setSidebarOpen: (open: boolean) => void;
  setStatusFilter: (filter: string) => void;

  updateIntervention: (id: number, updates: Partial<Intervention>) => void; // MODIFICATION: id is now number
  updateAgent: (id: number, updates: Partial<Agent>) => void; // MODIFICATION: id is now number
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  interventions: [],
  agents: [],
  messages: [],
  selectedIntervention: null,
  isInterventionModalOpen: false,
  isTeamAssignmentModalOpen: false,
  activeTab: 'interventions',
  interventionModalTab: 'details',
  sidebarOpen: false,
  statusFilter: '',

  // Actions
  setInterventions: (interventions) => set({ interventions }),
  setAgents: (agents) => set({ agents }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set(state => ({
    // Assure that we only add messages relevant to the selected intervention chat
    messages: state.selectedIntervention?.id === message.interventionId ? [...state.messages, message] : state.messages
  })),

  setSelectedIntervention: (intervention) => set({ selectedIntervention: intervention }),
  setInterventionModalOpen: (open) => set({ isInterventionModalOpen: open }),
  setTeamAssignmentModalOpen: (open) => set({ isTeamAssignmentModalOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setInterventionModalTab: (tab) => set({ interventionModalTab: tab }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),

  updateIntervention: (id, updates) => set(state => ({
    interventions: state.interventions.map(intervention =>
      intervention.id === id ? { ...intervention, ...updates } : intervention
    ),
    selectedIntervention: state.selectedIntervention?.id === id
      ? { ...state.selectedIntervention, ...updates }
      : state.selectedIntervention
  })),

  updateAgent: (id, updates) => set(state => ({
    agents: state.agents.map(agent =>
      agent.id === id ? { ...agent, ...updates } : agent
    )
  })),
}));