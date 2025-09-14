package com.eneo.support.service;

import com.eneo.support.model.Intervention;
import com.eneo.support.model.InterventionStatus;
import com.eneo.support.repository.InterventionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InterventionService {

    private static final Logger logger = LoggerFactory.getLogger(InterventionService.class);
    private final InterventionRepository interventionRepository;
    private final ZammadService zammadService;

    // --- DÉFINITION DES IDs DE STATUT ZAMMAD VALIDÉS ---
    // Corresponds à l'état "open" dans Zammad, que nous utiliserons comme "en attente" pour une intervention assignée.
    private static final int ZAMMAD_STATE_PENDING = 2;
    // Corresponds à l'état "closed" dans Zammad.
    private static final int ZAMMAD_STATE_CLOSED = 4;

    public InterventionService(InterventionRepository interventionRepository, ZammadService zammadService) {
        this.interventionRepository = interventionRepository;
        this.zammadService = zammadService;
    }

    public List<Intervention> getAllInterventions() {
        return interventionRepository.findAll();
    }

    public Optional<Intervention> assignIntervention(Long interventionId, Long agentId) {
        return interventionRepository.findById(interventionId).map(intervention -> {
            intervention.setAgentId(agentId);
            intervention.setStatus(InterventionStatus.ASSIGNE);
            Intervention updatedIntervention = interventionRepository.save(intervention);

            // On utilise maintenant la constante validée
            zammadService.updateTicketState(intervention.getZammadTicketId(), ZAMMAD_STATE_PENDING)
                    .doOnSuccess(v -> logger.info("Ticket Zammad {} mis à jour en état 'pending' (ID: {}).", intervention.getZammadTicketId(), ZAMMAD_STATE_PENDING))
                    .doOnError(error -> logger.error("Échec de la mise à jour du statut du ticket Zammad {} : {}", intervention.getZammadTicketId(), error.getMessage()))
                    .subscribe();

            logger.info("ACTION REQUISE : Envoyer une notification Push à l'agent {} pour l'intervention {}", agentId, interventionId);

            return updatedIntervention;
        });
    }

    public Optional<Intervention> resolveIntervention(Long interventionId) {
        return interventionRepository.findById(interventionId).map(intervention -> {
            intervention.setStatus(InterventionStatus.RESOLU);
            Intervention updatedIntervention = interventionRepository.save(intervention);

            // On utilise maintenant la constante validée
            zammadService.updateTicketState(intervention.getZammadTicketId(), ZAMMAD_STATE_CLOSED)
                    .doOnSuccess(v -> logger.info("Ticket Zammad {} a été fermé avec succès (ID: {}).", intervention.getZammadTicketId(), ZAMMAD_STATE_CLOSED))
                    .doOnError(error -> logger.error("Échec de la fermeture du ticket Zammad {} : {}", intervention.getZammadTicketId(), error.getMessage()))
                    .subscribe();

            logger.info("Intervention {} marquée comme résolue.", interventionId);

            return updatedIntervention;
        });
    }
}