package com.eneo.support.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO représentant le message envoyé par un agent via le webhook (n8n).
 */
@Data
@NoArgsConstructor // Crée le constructeur vide new ChatMessageResponse()
@AllArgsConstructor // Crée le constructeur new ChatMessageResponse(String reply)
public class AgentMessageRequest {
    private long ticketId;
    private String message;
}