package com.eneo.support.service;

import com.eneo.support.dto.RagRequest;
import com.eneo.support.dto.RagResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.List; // Importer List

/**
 * Service responsable de la communication avec l'API RAG externe (Python/Flask).
 * MODIFIÉ : Il envoie la question de l'utilisateur ET l'historique de la conversation.
 */
@Service
public class RagApiService {

    private final WebClient webClient;

    @Value("${rag.api.url}")
    private String ragApiUrl;

    public RagApiService(WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * ✅ MODIFICATION : La méthode accepte maintenant l'historique en paramètre.
     * @param message Le message actuel de l'utilisateur.
     * @param history L'historique des messages précédents.
     * @return Un Mono contenant l'objet RagResponse.
     */
    public Mono<RagResponse> getRagResponse(String message, List<RagRequest.MessageHistory> history) {
        // 1. Créer l'objet de la requête enrichie.
        RagRequest request = new RagRequest(message, history);

        // 2. Construire et exécuter l'appel API POST
        return this.webClient.post()
                .uri(ragApiUrl)
                .bodyValue(request) // Le corps de la requête contient maintenant l'historique
                .retrieve()
                .bodyToMono(RagResponse.class);
    }
}