package com.eneo.support.service;

import com.eneo.support.dto.AgentMessageRequest;
import com.eneo.support.dto.ChatMessageRequest;
import com.eneo.support.dto.ChatMessageResponse;
import com.eneo.support.dto.RagRequest;
import com.eneo.support.dto.RagResponse;
import com.eneo.support.model.Intervention;
import com.eneo.support.model.InterventionStatus;
import com.eneo.support.repository.InterventionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.Serializable;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    private final RagApiService ragApiService;
    private final ZammadService zammadService;
    private final ReactiveRedisTemplate<String, Object> redisTemplate;

    // INJECTION DE NOTRE NOUVEAU REPOSITORY
    private final InterventionRepository interventionRepository;

    // L'ancienne classe UserSessionData n'est plus la source de vérité,
    // mais peut être conservée pour le cache de l'historique de chat si besoin.
    // Pour l'instant, nous allons simplifier et nous baser sur la nouvelle logique.

    public ChatService(RagApiService ragApiService, ZammadService zammadService,
                       ReactiveRedisTemplate<String, Object> redisTemplate,
                       InterventionRepository interventionRepository) {
        this.ragApiService = ragApiService;
        this.zammadService = zammadService;
        this.redisTemplate = redisTemplate;
        this.interventionRepository = interventionRepository;
    }

    public Mono<ChatMessageResponse> processUserMessage(ChatMessageRequest request) {
        String userMessage = request.getMessage();
        String conversationId = request.getSessionId();
        String historyKey = "session:history:" + conversationId;

        return redisTemplate.opsForValue().get(historyKey)
                .defaultIfEmpty(new ArrayList<>())
                .flatMap(historyObject -> {
                    @SuppressWarnings("unchecked")
                    List<RagRequest.MessageHistory> history = ((List<Object>) historyObject).stream()
                            .map(obj -> (RagRequest.MessageHistory) obj)
                            .collect(Collectors.toList());

                    return ragApiService.getRagResponse(userMessage, history)
                            .flatMap(ragResponse -> {
                                String intent = ragResponse.getIntent();
                                String finalBotResponse = ragResponse.getAnswer() != null ? ragResponse.getAnswer() : getDefaultResponse(intent);

                                history.add(new RagRequest.MessageHistory("user", userMessage));
                                history.add(new RagRequest.MessageHistory("assistant", finalBotResponse));
                                redisTemplate.opsForValue().set(historyKey, history, Duration.ofHours(24)).subscribe();

                                // DÉCLENCHEMENT DE LA NOUVELLE LOGIQUE
                                handleInterventionLogicAsync(userMessage, finalBotResponse, conversationId, intent, request);

                                return Mono.just(new ChatMessageResponse(finalBotResponse));
                            });
                });
    }

    private void handleInterventionLogicAsync(String userMessage, String finalResponse, String sessionId, String intent, ChatMessageRequest currentUserInfo) {
        if ("SALUTATION".equals(intent) || "HORS_SUJET".equals(intent)) {
            return;
        }

        String articleContent = "Utilisateur: " + userMessage + "\n" + "Assistant: " + finalResponse;

        // On vérifie si une intervention pour cette session existe déjà dans notre BDD
        // Pour cet exemple, nous allons simplifier et supposer que la logique de création
        // ne s'applique qu'au premier message (quand l'historique est vide).

        // NOTE: Une logique plus robuste vérifierait la présence d'une intervention
        // en BDD avec le sessionId si celui-ci est persistant.
        // Ici, on se base sur la présence d'un UserSessionData dans Redis.

        String sessionDataKey = "session:data:" + sessionId;

        redisTemplate.opsForValue().get(sessionDataKey)
                .flatMap(sessionData -> {
                    // La conversation existe déjà, on ajoute juste un article
                    long ticketId = Long.parseLong(((UserSessionData) sessionData).getTicketId());
                    logger.info("Session existante trouvée. Ajout d'un article au ticket {}.", ticketId);
                    return zammadService.addArticleToTicket(ticketId, articleContent, false).then();
                })
                .switchIfEmpty(Mono.defer(() -> {
                    // C'est une nouvelle conversation
                    logger.info("Aucune session trouvée. Création d'un nouveau ticket et d'une intervention...");
                    return zammadService.findOrCreateUser(currentUserInfo.getFirstName(), currentUserInfo.getLastName(), currentUserInfo.getEmail(), currentUserInfo.getPhone())
                            .flatMap(zammadUser ->
                                    zammadService.createTicket(
                                            "Nouvelle réclamation de support",
                                            userMessage, // Le premier message est la description du problème
                                            zammadUser.getId(),
                                            currentUserInfo.getLatitude(),
                                            currentUserInfo.getLongitude()
                                    ).doOnSuccess(ticketResponse -> {
                                        // On a la réponse de Zammad, on peut maintenant créer notre intervention
                                        logger.info("Ticket Zammad {} créé. Création de l'intervention en base de données.", ticketResponse.getId());

                                        Intervention intervention = new Intervention();
                                        intervention.setZammadTicketId(ticketResponse.getId());
                                        intervention.setCustomerId(zammadUser.getId());
                                        intervention.setProblemDescription(userMessage);
                                        intervention.setLatitude(currentUserInfo.getLatitude());
                                        intervention.setLongitude(currentUserInfo.getLongitude());
                                        intervention.setStatus(InterventionStatus.NOUVEAU);

                                        interventionRepository.save(intervention); // Opération synchrone dans un thread non-bloquant

                                        // On sauvegarde les informations de session dans Redis pour les messages suivants
                                        UserSessionData newSessionData = new UserSessionData(String.valueOf(ticketResponse.getId()), currentUserInfo);
                                        redisTemplate.opsForValue().set(sessionDataKey, newSessionData, Duration.ofHours(24)).subscribe();
                                    })
                            ).then();
                }))
                .subscribeOn(Schedulers.boundedElastic())
                .subscribe(
                        null,
                        error -> logger.error("Erreur lors de la gestion de l'intervention: ", error)
                );
    }

    // La classe UserSessionData reste utile pour le cache Redis
    private static class UserSessionData implements Serializable {
        private String ticketId;
        // On pourrait garder d'autres infos si nécessaire
        public UserSessionData() {}
        public UserSessionData(String ticketId, ChatMessageRequest request) { this.ticketId = ticketId; }
        public String getTicketId() { return ticketId; }
    }

    private String getDefaultResponse(String intent) {
        if (intent == null) return "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ?";
        switch (intent) {
            case "FACTURE": return "Pour consulter votre facture, veuillez me donner votre numéro de contrat s'il vous plaît.";
            case "CONSOMMATION": return "Bien sûr. Quel est le numéro de votre compteur pour que je puisse vérifier votre consommation ?";
            case "HORS_SUJET": return "Je suis un assistant ENEO. Je ne peux répondre qu'aux questions sur nos services.";
            case "SALUTATION": return "Bonjour ! Comment puis-je vous aider aujourd'hui ?";
            default: return "Je ne suis pas certain de pouvoir vous aider avec cela. Pouvez-vous préciser votre demande ?";
        }
    }

    public void handleAgentReply(AgentMessageRequest request) {
        logger.info("Réponse de l'agent reçue pour le ticket ID {}. Message: '{}'", request.getTicketId(), request.getMessage());
        logger.info("ACTION REQUISE -> Envoyer une notification Push au client.");
    }
}