package com.eneo.support.dto;

import lombok.Data;
import java.io.Serializable; // AJOUT DE L'IMPORT

/**
 * DTO pour la mise à jour de la localisation d'un agent.
 * Implémente Serializable pour garantir une sérialisation correcte vers Redis.
 */
@Data
public class AgentLocationRequest implements Serializable { // AJOUT DE "implements Serializable"

    // Un serialVersionUID est une bonne pratique pour les classes sérialisables
    private static final long serialVersionUID = 1L;

    private Long agentId;
    private double latitude;
    private double longitude;
}