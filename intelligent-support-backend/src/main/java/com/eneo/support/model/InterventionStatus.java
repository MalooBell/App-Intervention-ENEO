package com.eneo.support.model;

/**
 * Enumération représentant les différents statuts possibles d'une intervention.
 * L'utilisation d'une énumération garantit la cohérence des données.
 */
public enum InterventionStatus {
    NOUVEAU,   // L'intervention vient d'être créée, aucun agent n'est assigné.
    ASSIGNE,   // Un agent a été assigné à l'intervention.
    RESOLU     // L'agent a terminé l'intervention.
}