package com.eneo.support.dto.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // Ignore les champs non nécessaires de la réponse de Zammad
public class ZammadTicketResponse {
    private Long id;
    private Long customer_id;


}