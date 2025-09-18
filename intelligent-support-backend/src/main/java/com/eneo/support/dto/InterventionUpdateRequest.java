package com.eneo.support.dto;

import lombok.Data;

/**
 * DTO (Data Transfer Object) utilisé pour les requêtes de mise à jour d'une intervention.
 * Ne contient que les champs modifiables par un administrateur.
 */
@Data
public class InterventionUpdateRequest {
    private String problemDescription;
    private Double latitude;
    private Double longitude;
}