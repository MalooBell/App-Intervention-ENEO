package com.eneo.support.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gère la logique de communication en temps réel pour le chat via WebSockets.
 */
@Component
public class ChatWebSocketHandler implements WebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(ChatWebSocketHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Un "Sink" est un composant réactif qui peut recevoir et diffuser des messages de manière thread-safe.
    // Nous lions chaque interventionId à un Sink pour créer des "salons de chat".
    private final Map<Long, Sinks.Many<String>> chatRooms = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        // 1. Extraire l'ID de l'intervention depuis l'URL de connexion
        Long interventionId = extractInterventionId(session);
        if (interventionId == null) {
            logger.error("Tentative de connexion WebSocket sans interventionId valide. Fermeture de la session.");
            return session.close();
        }

        // 2. Créer ou récupérer le "salon de chat" pour cette intervention
        Sinks.Many<String> sink = chatRooms.computeIfAbsent(interventionId, id ->
                Sinks.many().multicast().onBackpressureBuffer()
        );

        // 3. Logique de gestion des messages entrants (ce que le serveur reçoit)
        Mono<Void> input = session.receive()
                .map(WebSocketMessage::getPayloadAsText)
                .doOnNext(messageJson -> {
                    logger.info("Message reçu pour l'intervention {}: {}", interventionId, messageJson);
                    // On diffuse le message à tous les abonnés de ce salon de chat
                    sink.tryEmitNext(messageJson);
                })
                .then();

        // 4. Logique de gestion des messages sortants (ce que le serveur envoie)
        Flux<WebSocketMessage> output = sink.asFlux()
                .map(session::textMessage);

        // 5. On combine les deux logiques. La connexion reste ouverte tant que les deux flux sont actifs.
        return Mono.zip(input, session.send(output)).then();
    }

    /**
     * Méthode publique pour qu'un service externe (ex: ChatService) puisse injecter un message.
     */
    public void sendMessage(Long interventionId, Object messageObject) {
        Sinks.Many<String> sink = chatRooms.get(interventionId);
        if (sink != null) {
            try {
                String messageJson = objectMapper.writeValueAsString(messageObject);
                logger.info("Envoi d'un message système à l'intervention {}: {}", interventionId, messageJson);
                sink.tryEmitNext(messageJson);
            } catch (Exception e) {
                logger.error("Erreur de sérialisation du message pour l'intervention {}", interventionId, e);
            }
        }
    }

    private Long extractInterventionId(WebSocketSession session) {
        try {
            // L'URL est de la forme "/ws/chat/123"
            String path = session.getHandshakeInfo().getUri().getPath();
            return Long.parseLong(path.substring(path.lastIndexOf('/') + 1));
        } catch (Exception e) {
            return null;
        }
    }
}