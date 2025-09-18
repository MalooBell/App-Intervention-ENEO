// Service API adapté pour le backend ENEO
import { Agent, Intervention } from "@/types";

// IMPORTANT: Remplacez par l'adresse IP de votre machine où tourne le backend
const API_BASE_URL = 'http://192.168.43.80:8082'; 

class ApiService {
  private token: string | null = null;

  // L'authentification par token n'est pas encore gérée par le backend,
  // mais nous gardons la structure prête.
  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      // ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error ${response.status}: ${errorBody}`);
      }
      // Gère les réponses vides (comme pour resolveIntervention)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as T;
      }
      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // --- Authentification (SIMULÉE) ---
  async login(matricule: string, password: string) {
    // NOTE: Le backend n'a pas d'endpoint de login. Nous simulons une réussite.
    // En production, vous appellerez ici /api/v1/auth/agent/login
    console.log("Simulation de la connexion pour le matricule:", matricule);
    const agents = await this.getAllAgents();
    // On cherche un agent qui correspond (simulation grossière)
    const agent = agents.find(a => String(a.id) === matricule);

    if (!agent) {
      throw new Error("Agent non trouvé");
    }
    
    return { token: 'fake-jwt-token', agent: { ...agent, matricule, name: `${agent.firstName} ${agent.lastName}` } };
  }

  // --- Agents ---
  async getAllAgents(): Promise<Agent[]> {
      // Endpoint non-sécurisé utilisé pour la simulation du login
      return this.request<Agent[]>('/api/v1/admin/agents');
  }

  // --- Interventions ---
  async getAssignedInterventions(agentId: number): Promise<Intervention[]> {
    // NOTE: Le backend doit fournir un endpoint /api/v1/agent/me/interventions
    // En attendant, on récupère tout et on filtre côté client.
    const allInterventions = await this.request<Intervention[]>('/api/v1/admin/interventions');
    return allInterventions.filter(inter => 
        inter.assignedAgents.some(agent => agent.id === agentId)
    );
  }

  async resolveIntervention(interventionId: number): Promise<void> {
    await this.request<void>(`/api/v1/agent/interventions/${interventionId}/resolve`, {
      method: 'POST',
    });
  }

  // --- Géolocalisation (CORRECT) ---
  async updateLocation(agentId: number, latitude: number, longitude: number): Promise<void> {
    await this.request<void>('/api/v1/agent/location', {
      method: 'POST',
      body: JSON.stringify({ agentId, latitude, longitude }),
    });
  }
}

export const apiService = new ApiService();