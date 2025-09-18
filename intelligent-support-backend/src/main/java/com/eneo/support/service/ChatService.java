package com.eneo.support.service;

import com.eneo.support.dto.ChatMessageRequest;
import com.eneo.support.dto.ChatMessageResponse;
import com.eneo.support.model.Intervention;
import com.eneo.support.model.InterventionStatus;
import com.eneo.support.model.Message;
import com.eneo.support.model.SenderType;
import com.eneo.support.repository.InterventionRepository;
import com.eneo.support.repository.MessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    private final ZammadService zammadService;
    private final InterventionRepository interventionRepository;
    private final MessageRepository messageRepository;
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    private final ChatWebSocketHandler webSocketHandler;

    public ChatService(ZammadService zammadService,
                       InterventionRepository interventionRepository,
                       MessageRepository messageRepository,
                       ReactiveRedisTemplate<String, String> redisTemplate,
                       @Lazy ChatWebSocketHandler webSocketHandler) {
        this.zammadService = zammadService;
        this.interventionRepository = interventionRepository;
        this.messageRepository = messageRepository;
        this.redisTemplate = redisTemplate;
        this.webSocketHandler = webSocketHandler;
    }

    public Mono<ChatMessageResponse> processUserMessage(ChatMessageRequest request) {
        String sessionId = request.getSessionId();

        boolean isFirstMessage = (request.getEmail() != null && !request.getEmail().isEmpty()) ||
                (request.getPhone() != null && !request.getPhone().isEmpty());

        if (isFirstMessage) {
            return createNewIntervention(request)
                    .thenReturn(new ChatMessageResponse("Votre message a été transmis à un administrateur."));
        } else {
            String interventionIdKey = "session:intervention_id:" + sessionId;
            return redisTemplate.opsForValue().get(interventionIdKey)
                    // flatMap attend maintenant une valeur de retour (l'ID de l'intervention)
                    .flatMap(interventionId -> addMessageToIntervention(request.getMessage(), Long.parseLong(interventionId), SenderType.CUSTOMER))
                    // map est appelé uniquement si flatMap a émis une valeur, ce qui signifie que tout s'est bien passé
                    .map(savedInterventionId -> new ChatMessageResponse("Votre message a été transmis."))
                    // switchIfEmpty n'est maintenant appelé QUE si la clé de session n'est VRAIMENT pas trouvée dans Redis
                    .switchIfEmpty(Mono.defer(() -> {
                        logger.error("Session introuvable pour un message de suivi. Session ID: {}", sessionId);
                        return Mono.just(new ChatMessageResponse("Erreur : Votre session a peut-être expiré. Veuillez relancer la conversation si le problème persiste."));
                    }));
        }
    }

    private Mono<Void> createNewIntervention(ChatMessageRequest request) {
        return zammadService.findOrCreateUser(request.getFirstName(), request.getLastName(), request.getEmail(), request.getPhone())
                .flatMap(zammadUser -> zammadService.createTicket(
                        "Nouvelle réclamation de support",
                        request.getMessage(),
                        zammadUser.getId(),
                        request.getLatitude(),
                        request.getLongitude()
                ))
                .doOnSuccess(ticketResponse -> {
                    Intervention intervention = new Intervention();
                    intervention.setZammadTicketId(ticketResponse.getId());
                    intervention.setCustomerId(ticketResponse.getCustomer_id());
                    intervention.setProblemDescription(request.getMessage());
                    intervention.setLatitude(request.getLatitude());
                    intervention.setLongitude(request.getLongitude());
                    intervention.setStatus(InterventionStatus.NOUVEAU);

                    Intervention savedIntervention = interventionRepository.save(intervention);
                    logger.info("Intervention {} créée avec succès.", savedIntervention.getId());

                    addMessageAndBroadcast(request.getMessage(), savedIntervention, SenderType.CUSTOMER);

                    String interventionIdKey = "session:intervention_id:" + request.getSessionId();
                    redisTemplate.opsForValue().set(interventionIdKey, String.valueOf(savedIntervention.getId()), Duration.ofHours(24)).subscribe();
                })
                .doOnError(error -> logger.error("Échec de la création de l'intervention pour la session {}: ", request.getSessionId(), error))
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    // La signature de la méthode est changée de Mono<Void> à Mono<Long>
    public Mono<Long> addMessageToIntervention(String content, Long interventionId, SenderType senderType) {
        return Mono.fromCallable(() -> { // fromCallable permet de retourner une valeur
            interventionRepository.findById(interventionId).ifPresent(intervention ->
                    addMessageAndBroadcast(content, intervention, senderType)
            );
            return interventionId; // On retourne l'ID pour signaler le succès
        }).subscribeOn(Schedulers.boundedElastic());
    }

    private void addMessageAndBroadcast(String content, Intervention intervention, SenderType senderType) {
        Message message = new Message();
        message.setContent(content);
        message.setSenderType(senderType);
        message.setIntervention(intervention);
        Message savedMessage = messageRepository.save(message);
        logger.info("Message de {} ajouté à l'intervention {}.", senderType, intervention.getId());

        webSocketHandler.sendMessage(intervention.getId(), savedMessage);
    }
}