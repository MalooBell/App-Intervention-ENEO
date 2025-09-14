package com.eneo.support.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO représentant la réponse envoyée par le backend au client (Flutter).
 * C'est la "boîte" qui contient la réponse générée par l'IA.
 */
@Data
@NoArgsConstructor // Crée le constructeur vide new ChatMessageResponse()
@AllArgsConstructor // Crée le constructeur new ChatMessageResponse(String reply)
public class ChatMessageResponse {
    private String reply;
}