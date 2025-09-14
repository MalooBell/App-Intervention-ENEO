package com.eneo.support.dto.api;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GeminiContent {
    private String role; // "user" ou "model"
    private List<GeminiPart> parts;
}