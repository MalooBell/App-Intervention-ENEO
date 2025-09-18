// Types alignés sur le backend intelligent-support-backend

export type InterventionStatus = 'NOUVEAU' | 'ASSIGNE' | 'RESOLU';
export type AgentStatus = 'En ligne' | 'Hors ligne';

// Ce type représente ce que le backend envoie dans AgentStatusResponse
export interface Agent {
  id: number;
  firstName: string;
  lastName: string;
  available: boolean;
  status: AgentStatus;
  lastSeenAt: string;
  lastLatitude?: number;
  lastLongitude?: number;
  // On ajoute matricule et email pour le store d'authentification, même si l'API ne les renvoie pas tous
  matricule?: string; 
  email?: string;
}

// Ce type représente l'entité Intervention du backend
export interface Intervention {
  id: number;
  zammadTicketId: number;
  problemDescription: string;
  status: InterventionStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  customerId: number;
  assignedAgents: Agent[];
}