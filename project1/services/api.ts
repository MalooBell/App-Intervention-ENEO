const API_BASE_URL = 'http://your-backend-ip:8080/api/v1';
const WS_BASE_URL = 'ws://your-backend-ip:8082/ws/chat';

export interface SendMessageRequest {
  sessionId: string;
  message: string;
  customerName?: string;
  customerEmail?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export const apiService = {
  sendMessage: async (data: SendMessageRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  },

  getMessages: async (interventionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/interventions/${interventionId}/messages`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }
};

export const createWebSocketConnection = (sessionId: string) => {
  return new WebSocket(`${WS_BASE_URL}/${sessionId}`);
};