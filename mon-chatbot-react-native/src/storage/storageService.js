import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const CONVERSATIONS_KEY = '@conversations';
const USER_DATA_KEY = '@user_data';

// --- Gestion des données utilisateur ---

export const saveUserData = async (userData) => {
  try {
    const jsonValue = JSON.stringify(userData);
    await AsyncStorage.setItem(USER_DATA_KEY, jsonValue);
  } catch (e) {
    console.error("Erreur lors de la sauvegarde des données utilisateur", e);
  }
};

export const getUserData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Erreur lors de la récupération des données utilisateur", e);
    return null;
  }
};


// --- Gestion des conversations ---

/**
 * Récupère la liste de toutes les conversations.
 * @returns {Promise<Array>} La liste des conversations.
 */
export const getConversations = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Erreur lors de la récupération des conversations", e);
    return [];
  }
};

/**
 * Récupère les messages d'une conversation spécifique.
 * @param {string} sessionId - L'ID de la conversation.
 * @returns {Promise<Array>} La liste des messages.
 */
export const getMessagesForSession = async (sessionId) => {
    if (!sessionId) return [];
    try {
        const jsonValue = await AsyncStorage.getItem(`@messages_${sessionId}`);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Erreur lors de la récupération des messages", e);
        return [];
    }
};

/**
 * Sauvegarde un nouveau message et met à jour la liste des conversations.
 * @param {string} sessionId - L'ID de la conversation.
 * @param {object} newMessage - Le nouveau message à ajouter.
 * @param {boolean} isNewConversation - Vrai si c'est la première fois qu'on sauvegarde pour cette session.
 */
export const saveMessageAndUpdateConversation = async (sessionId, newMessage, isNewConversation) => {
    try {
        // 1. Sauvegarder le message
        const messages = await getMessagesForSession(sessionId);
        messages.push(newMessage);
        await AsyncStorage.setItem(`@messages_${sessionId}`, JSON.stringify(messages));

        // 2. Mettre à jour la liste des conversations
        const conversations = await getConversations();
        const conversationIndex = conversations.findIndex(c => c.id === sessionId);
        
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (isNewConversation) {
            // Créer une nouvelle conversation si elle n'existe pas
            const conversationName = newMessage.text.substring(0, 50); // Le nom est le début du premier message
            const newConversation = {
                id: sessionId,
                name: `Support: "${conversationName}..."`,
                lastMessage: newMessage.text,
                time: time,
                avatar: require('../../assets/logo.png'),
            };
            conversations.unshift(newConversation); // Ajouter au début de la liste
        } else if (conversationIndex !== -1) {
            // Mettre à jour une conversation existante
            const updatedConversation = {
                ...conversations[conversationIndex],
                lastMessage: newMessage.text,
                time: time,
            };
            // La remonter en haut de la liste
            conversations.splice(conversationIndex, 1);
            conversations.unshift(updatedConversation);
        }

        await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));

    } catch (e) {
        console.error("Erreur lors de la sauvegarde du message", e);
    }
};
