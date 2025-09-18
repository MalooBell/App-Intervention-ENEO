import { apiRequest } from "@/lib/queryClient";
import {
  Intervention,
  Agent,
  Message,
  UpdateInterventionRequest,
  AssignAgentsRequest,
  CreateMessageRequest,
  // Les types Insert ne sont pas utilisés directement par l'UI admin, mais on les garde pour référence
  InsertIntervention,
  InsertAgent
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = {
  // === Interventions ===
  getInterventions: async (): Promise<Intervention[]> => {
    const response = await apiRequest('GET', `${API_BASE_URL}/api/v1/admin/interventions`);
    return response.json();
  },

  updateIntervention: async (id: number, updates: UpdateInterventionRequest): Promise<Intervention> => {
    const response = await apiRequest('PUT', `${API_BASE_URL}/api/v1/admin/interventions/${id}`, updates);
    return response.json();
  },

  assignAgents: async (id: number, request: AssignAgentsRequest): Promise<Intervention> => {
    const response = await apiRequest('POST', `${API_BASE_URL}/api/v1/admin/interventions/${id}/assign`, request);
    return response.json();
  },

  resolveIntervention: async (id: number): Promise<Intervention> => {
    // Note: l'endpoint agent est utilisé ici comme dans le code original
    const response = await apiRequest('POST', `${API_BASE_URL}/api/v1/agent/interventions/${id}/resolve`);
    return response.json();
  },

  // === Agents ===
  getAgents: async (): Promise<Agent[]> => {
    const response = await apiRequest('GET', `${API_BASE_URL}/api/v1/admin/agents`);
    return response.json();
  },

  // === Messages ===
  getMessages: async (interventionId: number): Promise<Message[]> => {
    const response = await apiRequest('GET', `${API_BASE_URL}/api/v1/admin/interventions/${interventionId}/messages`);
    return response.json();
  },

  sendMessage: async (interventionId: number, request: CreateMessageRequest): Promise<void> => {
    // Cet endpoint retourne une réponse vide (200 OK)
    await apiRequest('POST', `${API_BASE_URL}/api/v1/admin/interventions/${interventionId}/messages`, request);
  },
};