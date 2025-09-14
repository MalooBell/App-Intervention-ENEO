package com.eneo.support.controller;

import com.eneo.support.dto.AgentLocationRequest;
import com.eneo.support.model.Intervention;
import com.eneo.support.service.AgentService; // AJOUT
import com.eneo.support.service.InterventionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // AJOUT

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final InterventionService interventionService;
    private final AgentService agentService; // AJOUT

    public AdminController(InterventionService interventionService, AgentService agentService) { // AJOUT
        this.interventionService = interventionService;
        this.agentService = agentService; // AJOUT
    }

    @GetMapping("/interventions")
    public ResponseEntity<List<Intervention>> getAllInterventions() {
        List<Intervention> interventions = interventionService.getAllInterventions();
        return ResponseEntity.ok(interventions);
    }

    /**
     * NOUVEL ENDPOINT : Récupère la liste de tous les agents en ligne.
     * @return Une liste des agents et de leur dernière localisation connue.
     */
    @GetMapping("/agents/online")
    public ResponseEntity<List<AgentLocationRequest>> getOnlineAgents() {
        List<AgentLocationRequest> onlineAgents = agentService.getOnlineAgents().collectList().block();
        return ResponseEntity.ok(onlineAgents);
    }

    @PostMapping("/interventions/{interventionId}/assign/{agentId}")
    public ResponseEntity<Intervention> assignIntervention(
            @PathVariable Long interventionId,
            @PathVariable Long agentId) {

        return interventionService.assignIntervention(interventionId, agentId)
                .map(ResponseEntity::ok) // Si l'intervention est trouvée et mise à jour, renvoyer 200 OK
                .orElse(ResponseEntity.notFound().build()); // Sinon, renvoyer 404 Not Found
    }
}