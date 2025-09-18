package com.eneo.support.controller;

import com.eneo.support.dto.*;
import com.eneo.support.model.Intervention;
import com.eneo.support.model.Message;
import com.eneo.support.service.AgentService;
import com.eneo.support.service.InterventionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST exposant les endpoints pour l'interface d'administration.
 * VERSION FINALE : Inclut la gestion complète des interventions et de la messagerie.
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final InterventionService interventionService;
    private final AgentService agentService;

    public AdminController(InterventionService interventionService, AgentService agentService) {
        this.interventionService = interventionService;
        this.agentService = agentService;
    }

    @GetMapping("/interventions")
    public ResponseEntity<List<Intervention>> getAllInterventions() {
        List<Intervention> interventions = interventionService.getAllInterventions();
        return ResponseEntity.ok(interventions);
    }

    @GetMapping("/agents")
    public ResponseEntity<List<AgentStatusResponse>> getAllAgents() {
        List<AgentStatusResponse> allAgents = agentService.getAllAgentsWithStatus();
        return ResponseEntity.ok(allAgents);
    }

    @PutMapping("/interventions/{interventionId}")
    public ResponseEntity<Intervention> updateIntervention(
            @PathVariable Long interventionId,
            @RequestBody InterventionUpdateRequest request) {

        return interventionService.updateIntervention(interventionId, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/interventions/{interventionId}/assign")
    public ResponseEntity<Intervention> assignAgents(
            @PathVariable Long interventionId,
            @RequestBody AssignAgentsRequest request) {

        return interventionService.assignAgentsToIntervention(interventionId, request.getAgentIds())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/interventions/{interventionId}/messages")
    public ResponseEntity<List<Message>> getInterventionMessages(@PathVariable Long interventionId) {
        return ResponseEntity.ok(interventionService.getMessagesForIntervention(interventionId));
    }

    @PostMapping("/interventions/{interventionId}/messages")
    public ResponseEntity<Void> postAdminMessage(@PathVariable Long interventionId, @RequestBody MessageRequest messageRequest) {
        interventionService.postMessageFromAdmin(interventionId, messageRequest.getContent());
        return ResponseEntity.ok().build();
    }
}