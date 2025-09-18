package com.eneo.support.controller;

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
 * C'est la "porte d'entrée" pour les clients utilisant l'application mobile.
 * VERSION CORRIGÉE : L'endpoint obsolète du webhook a été supprimé.
 */
@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Endpoint pour recevoir un message d'un client.
     * Déclenche la création d'une intervention ou ajoute le message à une conversation existante.
     * @param request Le corps de la requête contenant le message et les informations de session.
     * @return Une réponse de confirmation simple.
     */
    @PostMapping("/message")
    public Mono<ResponseEntity<ChatMessageResponse>> handleChatMessage(@RequestBody ChatMessageRequest request) {
        return chatService.processUserMessage(request)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.badRequest().build()); // Renvoie une erreur 400 si le Mono est vide
    }

    /*
     * L'endpoint @PostMapping("/webhook/update") a été supprimé car la méthode
     * chatService.handleAgentReply() n'existe plus dans la nouvelle architecture.
     * La communication de l'admin se fait maintenant via les endpoints de AdminController
     * et les WebSockets.
     */
}