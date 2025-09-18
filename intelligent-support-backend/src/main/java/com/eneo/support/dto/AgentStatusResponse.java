package com.eneo.support.dto;

import com.eneo.support.model.Agent;
import lombok.Data;
import java.time.Instant;

/**
 * DTO pour renvoyer l'état complet d'un agent, y compris son statut de connexion calculé.
 */
@Data
public class AgentStatusResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private boolean isAvailable;
    private Instant lastSeenAt;
    private Double lastLatitude;
    private Double lastLongitude;
    private String status; // "En ligne" ou "Hors ligne"

    public AgentStatusResponse(Agent agent, String status) {
        this.id = agent.getId();
        this.firstName = agent.getFirstName();
        this.lastName = agent.getLastName();
        this.isAvailable = agent.isAvailable();
        this.lastSeenAt = agent.getLastSeenAt();
        this.lastLatitude = agent.getLastLatitude();
        this.lastLongitude = agent.getLastLongitude();
        this.status = status;
    }
}