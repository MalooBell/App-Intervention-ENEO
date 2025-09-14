const API_URL = "http://192.168.43.80:8082/api/v1/chat"; // Assurez-vous que cette IP est accessible

/**
 * Envoie un message au backend.
 * @param {string} message - Le message de l'utilisateur.
 * @param {string} sessionId - L'identifiant de la session.
 * @param {object} [userData] - Données optionnelles de l'utilisateur (firstName, lastName, email, phone).
 * @returns {Promise<object>} La réponse du backend.
 */
export const sendMessage = async (message, sessionId, userData) => {
  try {
    const requestBody = {
      message,
      sessionId,
    };

    // CORRECTION : On ajoute toutes les données utilisateur si elles sont fournies
    if (userData) {
      requestBody.firstName = userData.firstName;
      requestBody.lastName = userData.lastName;
      requestBody.email = userData.email;
      requestBody.phone = userData.phone;
    }

    const response = await fetch(`${API_URL}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return { reply: "Désolé, une erreur de connexion est survenue." };
  }
};
