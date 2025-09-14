import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
// --- CORRECTION IMPORTATIONS ---
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements'; // <-- IMPORT CRUCIAL
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import { sendMessage } from '../services/chatService';
import { getUserData, getMessagesForSession, saveMessageAndUpdateConversation } from '../storage/storageService';
import { Ionicons } from '@expo/vector-icons';

const TypingIndicator = () => (
  <View style={[styles.bubble, styles.botBubble]}>
    <ActivityIndicator size="small" color="#007AFF" />
  </View>
);

export default function ChatScreen({ route }) {
  const { sessionId: existingSessionId } = route.params;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(existingSessionId || null);
  const [isNewConversation, setIsNewConversation] = useState(!existingSessionId);
  const [userData, setUserData] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const scrollViewRef = useRef();

  // --- OBTENTION DYNAMIQUE DE LA HAUTEUR DE L'EN-TÊTE ---
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    const initializeChat = async () => {
      const data = await getUserData();
      setUserData(data);

      let currentSessionId = existingSessionId;
      if (!currentSessionId) {
        currentSessionId = uuidv4();
        setSessionId(currentSessionId);
        setMessages([
          { _id: 1, sender: 'bot', text: `Bonjour ${data?.firstName || ''} ! Je suis Nia, comment puis-je vous aider aujourd'hui ?` },
        ]);
      } else {
        const historicMessages = await getMessagesForSession(currentSessionId);
        setMessages(historicMessages);
      }
    };
    
    initializeChat();
  }, [existingSessionId]);

  const handleSend = async () => {
    if (input.trim() === '' || !sessionId || !userData) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsBotTyping(true);
    await saveMessageAndUpdateConversation(sessionId, userMessage, isNewConversation);
    if (isNewConversation) setIsNewConversation(false);
    const response = await sendMessage(input, sessionId, userData);
    const botMessage = { sender: 'bot', text: response.reply };
    setIsBotTyping(false);
    setMessages(prev => [...prev, botMessage]);
    await saveMessageAndUpdateConversation(sessionId, botMessage, false);
  };
  
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isBotTyping]);

  return (
    // SafeAreaView gère maintenant les zones en haut et en bas de l'écran
    <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // --- CORRECTION DÉFINITIVE ---
        // On donne la hauteur exacte de l'en-tête pour un calcul parfait
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => (
            <View
              key={msg.text + index} // Utiliser une clé plus robuste
              style={[
                styles.bubble,
                msg.sender === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text style={msg.sender === 'user' ? styles.userBubbleText : styles.botBubbleText}>
                {msg.text}
              </Text>
            </View>
          ))}
          {isBotTyping && <TypingIndicator />}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Écrivez votre message..."
            placeholderTextColor="#9E9E9E"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F0F4F8',
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContentContainer: {
      paddingHorizontal: 12,
      paddingVertical: 16,
    },
    bubble: {
      maxWidth: '75%',
      padding: 14,
      borderRadius: 18,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 1.41,
      elevation: 2,
    },
    userBubble: {
      backgroundColor: '#007AFF',
      alignSelf: 'flex-end',
      borderBottomRightRadius: 4,
    },
    botBubble: {
      backgroundColor: '#FFFFFF',
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 4,
    },
    botBubbleText: {
      fontSize: 16,
      color: '#1C1C1E',
      lineHeight: 22,
    },
    userBubbleText: {
      fontSize: 16,
      color: 'white',
      lineHeight: 22,
    },
    inputContainer: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E5EA',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 120,
      backgroundColor: '#F0F4F8',
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingTop: Platform.OS === 'ios' ? 12 : 10,
      paddingBottom: Platform.OS === 'ios' ? 12 : 10,
      marginRight: 8,
      fontSize: 16,
      lineHeight: 20,
    },
    sendButton: {
      backgroundColor: '#007AFF',
      borderRadius: 22,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

