package com.eneo.support.dto;

import lombok.Data;

/**
 * DTO pour les requêtes de création d'un nouveau message par un administrateur.
 */
@Data
public class MessageRequest {
    private String content;
}