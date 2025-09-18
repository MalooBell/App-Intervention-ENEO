import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Send, Wifi, WifiOff } from 'lucide-react-native';
import { nanoid } from 'nanoid';
import { useComplaintStore } from '@/stores/complaintStore';
import { createWebSocketConnection } from '@/services/api';
import { ChatMessage, WebSocketMessage } from '@/types/complaint';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isClient = message.sender === 'client';
  
  return (
    <View style={[
      styles.messageBubble,
      isClient ? styles.clientMessage : styles.adminMessage
    ]}>
      <Text style={[
        styles.messageText,
        isClient ? styles.clientMessageText : styles.adminMessageText
      ]}>
        {message.message}
      </Text>
      <Text style={[
        styles.messageTime,
        isClient ? styles.clientMessageTime : styles.adminMessageTime
      ]}>
        {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  );
};

const ConnectionIndicator = ({ status }: { status: ConnectionStatus }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { icon: Wifi, color: 'hsl(142, 71%, 45%)', text: 'Connecté' };
      case 'connecting':
        return { icon: Wifi, color: '#f59e0b', text: 'Connexion...' };
      case 'disconnected':
        return { icon: WifiOff, color: '#6b7280', text: 'Déconnecté' };
      case 'error':
        return { icon: WifiOff, color: '#ef4444', text: 'Erreur de connexion' };
    }
  };

  const { icon: Icon, color, text } = getStatusInfo();

  return (
    <View style={styles.connectionIndicator}>
      <Icon size={12} color={color} />
      <Text style={[styles.connectionText, { color }]}>{text}</Text>
    </View>
  );
};

export default function ChatScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  
  const { currentComplaint, getMessages, addMessage } = useComplaintStore();
  const messages = getMessages(sessionId);
  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Connexion WebSocket
    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      
      try {
        const ws = createWebSocketConnection(sessionId);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connecté');
          setConnectionStatus('connected');
        };

        ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            
            const message: ChatMessage = {
              id: nanoid(),
              sessionId: data.sessionId,
              message: data.message,
              sender: data.sender === 'admin' ? 'admin' : 'client',
              timestamp: data.timestamp,
            };

            addMessage(sessionId, message);
          } catch (error) {
            console.error('Erreur lors du parsing du message WebSocket:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('Erreur WebSocket:', error);
          setConnectionStatus('error');
        };

        ws.onclose = () => {
          console.log('WebSocket fermé');
          setConnectionStatus('disconnected');
        };
      } catch (error) {
        console.error('Erreur lors de la connexion WebSocket:', error);
        setConnectionStatus('error');
      }
    };

    connectWebSocket();

    // Nettoyage
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [sessionId]);

  const sendMessage = () => {
    const message = inputMessage.trim();
    if (!message || !wsRef.current || connectionStatus !== 'connected') {
      return;
    }

    try {
      // Créer le message local
      const chatMessage: ChatMessage = {
        id: nanoid(),
        sessionId,
        message,
        sender: 'client',
        timestamp: new Date().toISOString(),
      };

      // Ajouter à la liste locale
      addMessage(sessionId, chatMessage);

      // Envoyer via WebSocket
      const wsMessage: WebSocketMessage = {
        sessionId,
        message,
        sender: 'client',
        timestamp: chatMessage.timestamp,
      };

      wsRef.current.send(JSON.stringify(wsMessage));
      setInputMessage('');

      // Scroll vers le bas
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    // La reconnexion se fera automatiquement via useEffect
  };

  if (!sessionId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Session introuvable</Text>
      </SafeAreaView>
    );
  }

  const complaint = currentComplaint || {
    sessionId,
    description: 'Réclamation en cours...',
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    location: { latitude: 0, longitude: 0 },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Réclamation - {new Date(complaint.createdAt).toLocaleDateString('fr-FR')}
          </Text>
          <ConnectionIndicator status={connectionStatus} />
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={() => (
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyTitle}>Conversation démarrée</Text>
            <Text style={styles.emptyDescription}>
              Votre réclamation a été envoyée. Un agent vous répondra bientôt.
            </Text>
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.messageInput}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Tapez votre message..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputMessage.trim() || connectionStatus !== 'connected') && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputMessage.trim() || connectionStatus !== 'connected'}
          >
            <Send size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        {connectionStatus === 'disconnected' || connectionStatus === 'error' ? (
          <TouchableOpacity style={styles.reconnectButton} onPress={handleReconnect}>
            <Text style={styles.reconnectText}>Appuyez pour reconnecter</Text>
          </TouchableOpacity>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'hsl(207, 100%, 35%)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  connectionText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  clientMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'hsl(207, 100%, 35%)',
    borderBottomRightRadius: 4,
  },
  adminMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  clientMessageText: {
    color: '#ffffff',
  },
  adminMessageText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  clientMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  adminMessageTime: {
    color: '#9ca3af',
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    backgroundColor: 'hsl(207, 100%, 35%)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  reconnectButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  reconnectText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});