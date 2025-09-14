package com.eneo.support.dto.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ZammadUser {
    private long id;
    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    // Zammad requiert un rôle pour la création
    private long[] role_ids;
}