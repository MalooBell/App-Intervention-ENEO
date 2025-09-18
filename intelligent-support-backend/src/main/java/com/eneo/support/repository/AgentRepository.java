package com.eneo.support.repository;

import com.eneo.support.model.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository pour l'entité Agent.
 */
@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
}