import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Complaint, ChatMessage } from '@/types/complaint';

interface ComplaintState {
  complaints: Complaint[];
  messages: Record<string, ChatMessage[]>;
  currentComplaint: Complaint | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadComplaints: () => Promise<void>;
  addComplaint: (complaint: Complaint) => Promise<void>;
  updateComplaintStatus: (sessionId: string, status: Complaint['status']) => Promise<void>;
  setCurrentComplaint: (complaint: Complaint | null) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  getMessages: (sessionId: string) => ChatMessage[];
  clearError: () => void;
}

const STORAGE_KEY = '@eneo_complaints';
const MESSAGES_KEY = '@eneo_messages';

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: [],
  messages: {},
  currentComplaint: null,
  isLoading: false,
  error: null,

  loadComplaints: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const complaintsData = await AsyncStorage.getItem(STORAGE_KEY);
      const messagesData = await AsyncStorage.getItem(MESSAGES_KEY);
      
      const complaints = complaintsData ? JSON.parse(complaintsData) : [];
      const messages = messagesData ? JSON.parse(messagesData) : {};
      
      set({ complaints, messages, isLoading: false });
    } catch (error) {
      set({ error: 'Erreur lors du chargement des réclamations', isLoading: false });
    }
  },

  addComplaint: async (complaint: Complaint) => {
    try {
      const { complaints } = get();
      const newComplaints = [complaint, ...complaints];
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newComplaints));
      set({ complaints: newComplaints });
    } catch (error) {
      set({ error: 'Erreur lors de la sauvegarde de la réclamation' });
    }
  },

  updateComplaintStatus: async (sessionId: string, status: Complaint['status']) => {
    try {
      const { complaints } = get();
      const updatedComplaints = complaints.map(complaint =>
        complaint.sessionId === sessionId ? { ...complaint, status } : complaint
      );
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedComplaints));
      set({ complaints: updatedComplaints });
    } catch (error) {
      set({ error: 'Erreur lors de la mise à jour du statut' });
    }
  },

  setCurrentComplaint: (complaint: Complaint | null) => {
    set({ currentComplaint: complaint });
  },

  addMessage: async (sessionId: string, message: ChatMessage) => {
    try {
      const { messages } = get();
      const sessionMessages = messages[sessionId] || [];
      const newMessages = {
        ...messages,
        [sessionId]: [...sessionMessages, message]
      };
      
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(newMessages));
      set({ messages: newMessages });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du message:', error);
    }
  },

  getMessages: (sessionId: string) => {
    const { messages } = get();
    return messages[sessionId] || [];
  },

  clearError: () => set({ error: null })
}));