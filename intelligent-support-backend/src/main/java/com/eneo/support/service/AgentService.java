package com.eneo.support.service;

import com.eneo.support.dto.AgentLocationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Service pour gérer la logique métier liée aux agents.
 */
@Service
public class AgentService {

    private static final Logger logger = LoggerFactory.getLogger(AgentService.class);
    private static final String AGENT_LOCATION_KEY_PREFIX = "agent:location:";

    private final ReactiveRedisTemplate<String, Object> redisTemplate;

    public AgentService(ReactiveRedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Met à jour la dernière position connue d'un agent dans Redis.
     * @param locationRequest Les données de localisation de l'agent.
     * @return Un Mono<Void> qui se termine quand l'opération est finie.
     */
    public Mono<Void> updateAgentLocation(AgentLocationRequest locationRequest) {
        if (locationRequest == null || locationRequest.getAgentId() == null) {
            logger.warn("Requête de mise à jour de localisation reçue avec des données invalides.");
            return Mono.empty();
        }

        String key = AGENT_LOCATION_KEY_PREFIX + locationRequest.getAgentId();

        // AJOUT D'UN LOG DÉTAILLÉ AVANT L'OPÉRATION
        logger.info("Mise à jour de la localisation pour l'agent ID {} -> Clé Redis: {}, Valeur: {}",
                locationRequest.getAgentId(), key, locationRequest.toString());

        return redisTemplate.opsForValue()
                .set(key, locationRequest, Duration.ofMinutes(5))
                .doOnError(error -> logger.error("Erreur lors de l'écriture dans Redis pour la clé {}: ", key, error))
                .then();
    }

    /**
     * Récupère la liste de tous les agents en ligne et leur position.
     * @return Un Flux (une liste réactive) d'objets de localisation d'agents.
     */
    public Flux<AgentLocationRequest> getOnlineAgents() {
        return redisTemplate.keys(AGENT_LOCATION_KEY_PREFIX + "*")
                .flatMap(key -> redisTemplate.opsForValue().get(key))
                .cast(AgentLocationRequest.class)
                .doOnError(error -> logger.error("Erreur lors de la lecture des positions agents depuis Redis: ", error));
    }
}