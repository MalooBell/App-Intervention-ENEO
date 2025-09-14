package com.eneo.support.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO représentant la requête envoyée par le client (Flutter) au backend.
 * C'est la "boîte" qui contient le message de l'utilisateur.
 */
@Data
@NoArgsConstructor // Crée le constructeur vide new ChatMessageResponse()
@AllArgsConstructor // Crée le constructeur new ChatMessageResponse(String reply)
public class ChatMessageRequest {
    private String message;
    private String sessionId;
    // Ajout des champs pour l'identification de l'utilisateur
    // Ils seront envoyés uniquement au début d'une nouvelle conversation
    private String email;
    private String phone;
    private String firstName;
    private String lastName;

    // NOUVEAUX CHAMPS POUR LA GÉOLOCALISATION
    private double latitude;
    private double longitude;
}