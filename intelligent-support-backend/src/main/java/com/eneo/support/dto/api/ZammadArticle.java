package com.eneo.support.dto.api;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ZammadArticle {
    private String subject;
    private String body;
    private String type = "note";
    private boolean internal = false;
}