package com.eneo.support.service;

import com.eneo.support.dto.InterventionUpdateRequest;
import com.eneo.support.dto.AssignAgentsRequest; // Assurez-vous d'avoir ce DTO
import com.eneo.support.model.Agent;
import com.eneo.support.model.Intervention;
import com.eneo.support.model.InterventionStatus;
import com.eneo.support.model.Message;
import com.eneo.support.model.SenderType;
import com.eneo.support.repository.AgentRepository;
import com.eneo.support.repository.InterventionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InterventionService {

    private static final Logger logger = LoggerFactory.getLogger(InterventionService.class);
    private final InterventionRepository interventionRepository;
    private final AgentRepository agentRepository;
    private final ZammadService zammadService;
    private final ChatService chatService;

    private static final int ZAMMAD_STATE_PENDING = 2;
    private static final int ZAMMAD_STATE_CLOSED = 4;

    public InterventionService(InterventionRepository interventionRepository,
                               AgentRepository agentRepository,
                               ZammadService zammadService,
                               @Lazy ChatService chatService) {
        this.interventionRepository = interventionRepository;
        this.agentRepository = agentRepository;
        this.zammadService = zammadService;
        this.chatService = chatService;
    }

    public List<Intervention> getAllInterventions() {
        return interventionRepository.findAll();
    }

    @Transactional
    public Optional<Intervention> updateIntervention(Long interventionId, InterventionUpdateRequest request) {
        return interventionRepository.findById(interventionId).map(intervention -> {
            logger.info("Mise à jour de l'intervention ID: {}", interventionId);
            intervention.setProblemDescription(request.getProblemDescription());
            intervention.setLatitude(request.getLatitude());
            intervention.setLongitude(request.getLongitude());
            return interventionRepository.save(intervention);
        });
    }

    @Transactional
    public Optional<Intervention> assignAgentsToIntervention(Long interventionId, List<Long> agentIds) {
        return interventionRepository.findById(interventionId).map(intervention -> {
            List<Agent> agentsToAssign = agentRepository.findAllById(agentIds);

            intervention.getAssignedAgents().clear();
            intervention.getAssignedAgents().addAll(agentsToAssign);
            intervention.setStatus(InterventionStatus.ASSIGNE);

            Intervention updatedIntervention = interventionRepository.save(intervention);

            zammadService.updateTicketState(intervention.getZammadTicketId(), ZAMMAD_STATE_PENDING)
                    .doOnSuccess(v -> logger.info("Ticket Zammad {} mis à jour en état 'pending'.", intervention.getZammadTicketId()))
                    .doOnError(error -> logger.error("Échec de la mise à jour du ticket Zammad {}: {}", intervention.getZammadTicketId(), error.getMessage()))
                    .subscribe();

            String agentIdList = agentIds.stream().map(String::valueOf).collect(Collectors.joining(", "));
            logger.info("ACTION REQUISE : Envoyer une notification Push aux agents [{}] pour l'intervention {}", agentIdList, interventionId);

            return updatedIntervention;
        });
    }

    @Transactional
    public Optional<Intervention> resolveIntervention(Long interventionId) {
        return interventionRepository.findById(interventionId).map(intervention -> {
            intervention.setStatus(InterventionStatus.RESOLU);
            Intervention updatedIntervention = interventionRepository.save(intervention);

            zammadService.updateTicketState(intervention.getZammadTicketId(), ZAMMAD_STATE_CLOSED)
                    .doOnSuccess(v -> logger.info("Ticket Zammad {} a été fermé avec succès.", intervention.getZammadTicketId()))
                    .doOnError(error -> logger.error("Échec de la fermeture du ticket Zammad {}: {}", intervention.getZammadTicketId(), error.getMessage()))
                    .subscribe();

            logger.info("Intervention {} marquée comme résolue.", interventionId);

            return updatedIntervention;
        });
    }

    public List<Message> getMessagesForIntervention(Long interventionId) {
        return interventionRepository.findById(interventionId)
                .map(Intervention::getMessages)
                .orElse(Collections.emptyList());
    }

    public void postMessageFromAdmin(Long interventionId, String content) {
        chatService.addMessageToIntervention(content, interventionId, SenderType.ADMIN).subscribe();
    }
}