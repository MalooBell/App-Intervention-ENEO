// ENEO Operations Hub - TypeScript Definitions
// VERSION MISE A JOUR - Synchronisée avec le backend Spring Boot.

// --- Types principaux correspondant aux entités du backend ---

// Statuts envoyés par le backend pour une intervention
export type InterventionStatus = 'NOUVEAU' | 'ASSIGNE' | 'RESOLU';

// Statuts calculés par le backend pour un agent
export type AgentStatus = 'En ligne' | 'Hors ligne';

// Types d'expéditeurs pour les messages
export type SenderType = 'CUSTOMER' | 'ADMIN';

// Structure de l'objet Intervention correspondant à la réponse de l'API Java
export interface Intervention {
  id: number;
  zammadTicketId: number;
  problemDescription: string;
  status: InterventionStatus;
  latitude: number;
  longitude: number;
  createdAt: string; // Instant is serialized as string
  updatedAt: string; // Instant is serialized as string
  customerId: number;
  assignedAgents: Agent[];
  messages: Message[];
}

// Structure de l'objet Agent (AgentStatusResponse)
export interface Agent {
  id: number;
  firstName: string;
  lastName: string;
  available: boolean;
  status: AgentStatus;
  lastSeenAt: string; // Instant is serialized as string
  lastLatitude?: number;
  lastLongitude?: number;
}

// Structure d'un message dans une conversation
export interface Message {
  id: number;
  content: string;
  senderType: SenderType;
  timestamp: string; // Instant is serialized as string
}


// --- Types pour les requêtes API (DTOs) ---

// Pour l'envoi d'un message par l'admin (MessageRequest.java)
export interface CreateMessageRequest {
  content: string;
}

// Pour la mise à jour d'une intervention (InterventionUpdateRequest.java)
export interface UpdateInterventionRequest {
  problemDescription?: string;
  latitude?: number;
  longitude?: number;
}

// Pour l'assignation d'une équipe (AssignAgentsRequest.java)
export interface AssignAgentsRequest {
  agentIds: number[];
}

// Types pour la création (non directement utilisés dans l'UI admin mais bon à avoir)
export type InsertIntervention = Omit<Intervention, 'id' | 'createdAt' | 'updatedAt' | 'assignedAgents' | 'messages' | 'zammadTicketId' | 'customerId'>;
export type InsertAgent = Omit<Agent, 'id' | 'lastSeenAt'>;