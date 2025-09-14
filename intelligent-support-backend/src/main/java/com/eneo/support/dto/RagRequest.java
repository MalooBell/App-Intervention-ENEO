package com.eneo.support.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.io.Serializable;
import java.util.List;

/**
 * Représente le corps de la requête JSON envoyée à l'API RAG.
 * MODIFIÉ : Contient la question actuelle et l'historique de la conversation.
 */
@JsonInclude(JsonInclude.Include.NON_NULL) // N'inclut pas les champs nuls dans le JSON
public class RagRequest {

    private String question;
    // ✅ AJOUT : Une liste pour contenir l'historique des messages.
    private List<MessageHistory> history;

    // Constructeur mis à jour
    public RagRequest(String question, List<MessageHistory> history) {
        this.question = question;
        this.history = history;
    }

    // Getters et Setters
    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<MessageHistory> getHistory() {
        return history;
    }

    public void setHistory(List<MessageHistory> history) {
        this.history = history;
    }

    /**
     * ✅ AJOUT : Une classe interne pour structurer chaque message de l'historique.
     * Implémente Serializable pour être compatible avec Redis.
     */
    public static class MessageHistory implements Serializable {
        private String role; // "user" ou "assistant"
        private String content;

        // Constructeur vide nécessaire pour la désérialisation
        public MessageHistory() {}

        public MessageHistory(String role, String content) {
            this.role = role;
            this.content = content;
        }

        // Getters et Setters
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}