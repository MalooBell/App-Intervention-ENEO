package com.eneo.support.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO pour les requêtes d'assignation d'un ou plusieurs agents à une intervention.
 */
@Data
public class AssignAgentsRequest {
    private List<Long> agentIds;
}