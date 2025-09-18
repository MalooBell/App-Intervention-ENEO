export interface Complaint {
  sessionId: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  sender: 'client' | 'admin';
  timestamp: string;
}

export interface WebSocketMessage {
  sessionId: string;
  message: string;
  sender: string;
  timestamp: string;
}