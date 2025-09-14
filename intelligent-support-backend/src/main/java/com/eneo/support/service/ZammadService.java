package com.eneo.support.service;

import com.eneo.support.dto.api.ZammadArticle;
import com.eneo.support.dto.api.ZammadTicket;
import com.eneo.support.dto.api.ZammadTicketResponse;
import com.eneo.support.dto.api.ZammadUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.List;
import java.util.Map; // Import nécessaire

/**
 * Service pour interagir avec l'API de Zammad.
 * Gère la création, la mise à jour et la consultation des utilisateurs et tickets.
 */
@Service
public class ZammadService {

    private final WebClient webClient;
    private final String zammadApiBaseUrl;
    private final String zammadApiToken;
    private static final long ZAMMAD_DEFAULT_ROLE_ID = 2;

    public ZammadService(WebClient webClient,
                         @Value("${zammad.api.base-url}") String zammadApiBaseUrl,
                         @Value("${zammad.api.token}") String zammadApiToken) {
        this.webClient = webClient;
        this.zammadApiBaseUrl = zammadApiBaseUrl;
        this.zammadApiToken = zammadApiToken;
    }

    public Mono<ZammadUser> findOrCreateUser(String firstName, String lastName, String email, String phone) {
        String searchQuery = (email != null && !email.isEmpty()) ? email : phone;

        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return Mono.error(new IllegalArgumentException("Un email ou un numéro de téléphone doit être fourni."));
        }

        return findUser(searchQuery)
                .switchIfEmpty(Mono.defer(() -> createUser(firstName, lastName, email, phone)));
    }

    private Mono<ZammadUser> findUser(String query) {
        return webClient.get()
                .uri(zammadApiBaseUrl + "/users/search?query=" + query)
                .header(HttpHeaders.AUTHORIZATION, "Token token=" + zammadApiToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<ZammadUser>>() {})
                .flatMap(users -> {
                    if (!users.isEmpty()) {
                        return Mono.just(users.get(0));
                    }
                    return Mono.empty();
                });
    }

    private Mono<ZammadUser> createUser(String firstName, String lastName, String email, String phone) {
        ZammadUser newUser = new ZammadUser();
        newUser.setFirstname(firstName != null && !firstName.isEmpty() ? firstName : "Utilisateur");
        newUser.setLastname(lastName != null && !lastName.isEmpty() ? lastName : "Support");
        newUser.setEmail(email);
        newUser.setPhone(phone);
        newUser.setRole_ids(new long[]{ZAMMAD_DEFAULT_ROLE_ID});

        return webClient.post()
                .uri(zammadApiBaseUrl + "/users")
                .header(HttpHeaders.AUTHORIZATION, "Token token=" + zammadApiToken)
                .bodyValue(newUser)
                .retrieve()
                .bodyToMono(ZammadUser.class);
    }

    public Mono<ZammadTicketResponse> createTicket(String title, String userMessage, long customerId, double latitude, double longitude) {
        ZammadArticle firstArticle = new ZammadArticle(null, userMessage, "note", false);

        ZammadTicket newTicketRequest = new ZammadTicket();
        newTicketRequest.setTitle(title);
        newTicketRequest.setGroup("Agence en Ligne");
        newTicketRequest.setCustomer_id(customerId);
        newTicketRequest.setArticle(firstArticle);
        newTicketRequest.setLatitude(String.valueOf(latitude));
        newTicketRequest.setLongitude(String.valueOf(longitude));

        return webClient.post()
                .uri(zammadApiBaseUrl + "/tickets")
                .header(HttpHeaders.AUTHORIZATION, "Token token=" + zammadApiToken)
                .bodyValue(newTicketRequest)
                .retrieve()
                .bodyToMono(ZammadTicketResponse.class);
    }

    public Mono<Void> addArticleToTicket(long ticketId, String messageBody, boolean isInternal) {
        // On utilise un Record pour une classe DTO simple et immuable
        record ArticleCreationRequest(long ticket_id, String body, String type, boolean internal) {}
        ArticleCreationRequest request = new ArticleCreationRequest(ticketId, messageBody, "note", isInternal);

        return webClient.post()
                .uri(zammadApiBaseUrl + "/ticket_articles")
                .header(HttpHeaders.AUTHORIZATION, "Token token=" + zammadApiToken)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Void.class);
    }

    /**
     * NOUVELLE MÉTHODE : Met à jour l'état d'un ticket.
     * C'est la méthode qui manquait.
     * @param ticketId L'ID du ticket à mettre à jour.
     * @param stateId L'ID du nouvel état (ex: 2 pour "pending close", 4 pour "closed").
     * @return Un Mono<Void> qui se termine quand l'opération est finie.
     */
    public Mono<Void> updateTicketState(long ticketId, int stateId) {
        // L'API de Zammad pour la mise à jour attend un corps JSON avec les champs à changer.
        // Map.of est un moyen simple de créer un corps JSON { "state_id": stateId }.
        Map<String, Integer> requestBody = Map.of("state_id", stateId);

        return webClient.put()
                .uri(zammadApiBaseUrl + "/tickets/" + ticketId)
                .header(HttpHeaders.AUTHORIZATION, "Token token=" + zammadApiToken)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Void.class);
    }
}