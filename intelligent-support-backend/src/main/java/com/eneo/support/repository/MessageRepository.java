package com.eneo.support.repository;

import com.eneo.support.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository pour l'entité Message.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
}