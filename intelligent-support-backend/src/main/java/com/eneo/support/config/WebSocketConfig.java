package com.eneo.support.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuration pour activer et mapper les WebSockets dans l'application.
 */
@Configuration
public class WebSocketConfig {

    // Note : Le WebSocketHandler sera créé dans la prochaine étape.
    // Pour l'instant, cette configuration est prête à l'accueillir.

    @Bean
    public HandlerMapping handlerMapping(WebSocketHandler chatWebSocketHandler) {
        // On mappe l'URL "/ws/chat" à notre futur handler de chat
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/ws/chat/{interventionId}", chatWebSocketHandler);

        // Ordre de priorité pour cette configuration
        int order = -1;

        return new SimpleUrlHandlerMapping(map, order);
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}