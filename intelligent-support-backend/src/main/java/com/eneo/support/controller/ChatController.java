package com.eneo.support.controller;

import com.eneo.support.dto.AgentMessageRequest;
import com.eneo.support.dto.ChatMessageRequest;
import com.eneo.support.dto.ChatMessageResponse;
import com.eneo.support.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/**
 * Le contrôleur REST qui expose notre logique de chat au monde extérieur.
 * C'est la "porte d'entrée" de notre API.
 */
@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Endpoint pour recevoir un nouveau message de l'utilisateur et démarrer le traitement.
     * @param request Le corps de la requête contenant le message de l'utilisateur.
     * @return Une réponse contenant le message de l'IA.
     */
    @PostMapping("/message")
    public Mono<ResponseEntity<ChatMessageResponse>> handleChatMessage(@RequestBody ChatMessageRequest request) {
        // Correction de l'appel de méthode
        return chatService.processUserMessage(request)
                .map(response -> ResponseEntity.ok(response)) // Si tout va bien, renvoyer une réponse 200 OK avec le corps
                .defaultIfEmpty(ResponseEntity.notFound().build()); // S'il n'y a pas de réponse, renvoyer une erreur 404 Not Found
    }

    /**
     * Endpoint pour recevoir les mises à jour venant des agents via notre orchestrateur (n8n).
     * @param request Le corps de la requête contenant l'ID du ticket et le message de l'agent.
     * @return Une réponse vide avec un statut 200 OK pour confirmer la réception.
     */
    @PostMapping("/webhook/update")
    public ResponseEntity<Void> handleWebhookUpdate(@RequestBody AgentMessageRequest request) {
        // Cette méthode peut rester telle quelle si vous prévoyez de la réutiliser
        chatService.handleAgentReply(request);
        return ResponseEntity.ok().build();
    }
}