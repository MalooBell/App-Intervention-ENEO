package com.eneo.support.controller;

import com.eneo.support.dto.AgentLocationRequest;
import com.eneo.support.model.Intervention;
import com.eneo.support.service.AgentService;
import com.eneo.support.service.InterventionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/agent")
public class AgentController {

    private static final Logger logger = LoggerFactory.getLogger(AgentController.class);

    private final AgentService agentService;
    private final InterventionService interventionService;

    public AgentController(AgentService agentService, InterventionService interventionService) {
        this.agentService = agentService;
        this.interventionService = interventionService;
    }

    @PostMapping("/location")
    public Mono<ResponseEntity<Void>> updateLocation(@RequestBody AgentLocationRequest locationRequest) {
        logger.info("Requête reçue sur /api/v1/agent/location pour l'agent ID: {}", locationRequest.getAgentId());
        return agentService.updateAgentLocation(locationRequest)
                .then(Mono.just(ResponseEntity.ok().build()));
    }

    /**
     * Endpoint pour qu'un agent marque une intervention comme résolue.
     * @param interventionId L'ID de l'intervention terminée.
     * @return L'intervention mise à jour avec le statut RESOLU.
     */
    @PostMapping("/interventions/{interventionId}/resolve")
    public ResponseEntity<Intervention> resolveIntervention(@PathVariable Long interventionId) {
        logger.info("Requête reçue pour résoudre l'intervention ID: {}", interventionId);
        return interventionService.resolveIntervention(interventionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}