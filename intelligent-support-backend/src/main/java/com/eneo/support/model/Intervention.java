package com.eneo.support.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Entité JPA représentant une intervention sur le terrain.
 * VERSION LOMBOK : Utilise @Data pour générer automatiquement les getters, setters, toString, etc.
 */
@Data // Annotation Lombok qui remplace getters, setters, toString, equals, hashCode
@Entity
@Table(name = "interventions")
public class Intervention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long zammadTicketId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterventionStatus status;

    @Column(columnDefinition = "TEXT")
    private String problemDescription;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(nullable = true)
    private Long customerId;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "intervention_agents",
            joinColumns = @JoinColumn(name = "intervention_id"),
            inverseJoinColumns = @JoinColumn(name = "agent_id")
    )
    @JsonManagedReference // Côté "parent" pour la relation avec Agent (évite boucle JSON)
    private Set<Agent> assignedAgents = new HashSet<>();

    @OneToMany(mappedBy = "intervention", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Côté "parent" pour la relation avec Message (évite boucle JSON)
    private List<Message> messages = new ArrayList<>();

}