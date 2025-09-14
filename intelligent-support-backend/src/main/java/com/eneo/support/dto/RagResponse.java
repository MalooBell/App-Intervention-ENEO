package com.eneo.support.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * Représente la réponse JSON structurée reçue de l'API RAG.
 * Elle contient l'intention détectée, la réponse textuelle (si applicable)
 * et les sources utilisées.
 */
// Annotation cruciale : si l'API Python ajoute de nouveaux champs dans le futur,
// notre application Java ne plantera pas. Elle ignorera simplement les champs inconnus.
@JsonIgnoreProperties(ignoreUnknown = true)
public class RagResponse {

    private String intent;
    private String answer;
    private List<String> sources;

    // Constructeur par défaut (nécessaire pour la désérialisation)
    public RagResponse() {
    }

    // Getters et Setters
    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<String> getSources() {
        return sources;
    }

    public void setSources(List<String> sources) {
        this.sources = sources;
    }
}