package com.eneo.support.service;

import com.eneo.support.dto.AgentLocationRequest;
import com.eneo.support.dto.AgentStatusResponse;
import com.eneo.support.model.Agent;
import com.eneo.support.repository.AgentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour gérer la logique métier liée aux agents.
 * VERSION MISE À JOUR : Gère la persistance en base de données et le statut de connexion.
 */
@Service
public class AgentService {

    private static final Logger logger = LoggerFactory.getLogger(AgentService.class);
    private static final String AGENT_LOCATION_KEY_PREFIX = "agent:location:";

    private final ReactiveRedisTemplate<String, Object> redisTemplate;
    private final AgentRepository agentRepository;

    public AgentService(ReactiveRedisTemplate<String, Object> redisTemplate, AgentRepository agentRepository) {
        this.redisTemplate = redisTemplate;
        this.agentRepository = agentRepository;
    }

    /**
     * Met à jour la dernière position connue d'un agent dans Redis (temps réel)
     * ET dans la base de données PostgreSQL (persistance).
     */
    public Mono<Void> updateAgentLocation(AgentLocationRequest locationRequest) {
        if (locationRequest == null || locationRequest.getAgentId() == null) {
            logger.warn("Requête de mise à jour de localisation reçue avec des données invalides.");
            return Mono.empty();
        }

        String key = AGENT_LOCATION_KEY_PREFIX + locationRequest.getAgentId();

        // Exécuter la sauvegarde en base de données en arrière-plan
        Mono.fromRunnable(() -> {
            Agent agent = agentRepository.findById(locationRequest.getAgentId())
                    .orElseGet(() -> {
                        // Si l'agent n'existe pas, on le crée à la volée.
                        // Dans un vrai système, la création d'agent serait un processus séparé.
                        logger.warn("L'agent avec l'ID {} n'a pas été trouvé. Création d'un nouvel agent.", locationRequest.getAgentId());
                        Agent newAgent = new Agent();
                        newAgent.setId(locationRequest.getAgentId());
                        newAgent.setFirstName("Agent"); // Valeur par défaut
                        newAgent.setLastName(String.valueOf(locationRequest.getAgentId()));
                        return newAgent;
                    });

            agent.setLastLatitude(locationRequest.getLatitude());
            agent.setLastLongitude(locationRequest.getLongitude());
            agent.setLastSeenAt(Instant.now());
            agentRepository.save(agent);
            logger.info("Position de l'agent {} persistée en base de données.", agent.getId());
        }).subscribeOn(Schedulers.boundedElastic()).subscribe();

        // Écrire dans Redis pour le suivi temps réel avec une expiration
        logger.info("Mise à jour de la localisation pour l'agent ID {} -> Clé Redis: {}, Valeur: {}",
                locationRequest.getAgentId(), key, locationRequest.toString());
        return redisTemplate.opsForValue()
                .set(key, locationRequest, Duration.ofMinutes(5))
                .doOnError(error -> logger.error("Erreur lors de l'écriture dans Redis pour la clé {}: ", key, error))
                .then();
    }

    /**
     * Récupère la liste de tous les agents (depuis PostgreSQL) et calcule leur statut.
     * Un agent est "En ligne" si sa dernière position a été vue il y a moins de 5 minutes.
     * @return Une liste d'objets AgentStatusResponse.
     */
    public List<AgentStatusResponse> getAllAgentsWithStatus() {
        List<Agent> allAgents = agentRepository.findAll();
        Instant fiveMinutesAgo = Instant.now().minus(Duration.ofMinutes(5));

        return allAgents.stream().map(agent -> {
            boolean isOnline = agent.getLastSeenAt() != null && agent.getLastSeenAt().isAfter(fiveMinutesAgo);
            String status = isOnline ? "En ligne" : "Hors ligne";
            return new AgentStatusResponse(agent, status);
        }).collect(Collectors.toList());
    }
}