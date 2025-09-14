package com.eneo.support.repository;

import com.eneo.support.model.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository pour l'entité Intervention.
 * Fournit les opérations CRUD (Create, Read, Update, Delete) pour les interventions.
 */
@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Long> {
}