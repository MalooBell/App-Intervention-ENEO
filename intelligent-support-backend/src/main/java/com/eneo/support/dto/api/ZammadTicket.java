package com.eneo.support.dto.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // N'inclut pas les champs nuls dans le JSON
public class ZammadTicket {
    private String title;
    private String group;
    private long customer_id;
    private ZammadArticle article;

    // NOUVEAUX CHAMPS CORRESPONDANT AUX CHAMPS PERSONNALISÉS DE ZAMMAD
    // Le nom de la variable doit correspondre exactement au nom interne défini dans Zammad.
    // Nous les déclarons comme String car c'est le type attendu par Zammad.
    private String latitude;
    private String longitude;
}