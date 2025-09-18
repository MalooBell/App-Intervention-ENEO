package com.eneo.support.model;

import com.fasterxml.jackson.annotation.JsonBackReference; // AJOUT DE L'IMPORT
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "agents")
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    private boolean isAvailable;

    private Instant lastSeenAt;

    private Double lastLatitude;
    private Double lastLongitude;

    @ManyToMany(mappedBy = "assignedAgents")
    @JsonBackReference // AJOUT DE L'ANNOTATION
    private Set<Intervention> interventions = new HashSet<>();

    // --- Getters et Setters (inchangés) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public Instant getLastSeenAt() {
        return lastSeenAt;
    }

    public void setLastSeenAt(Instant lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }

    public Double getLastLatitude() {
        return lastLatitude;
    }

    public void setLastLatitude(Double lastLatitude) {
        this.lastLatitude = lastLatitude;
    }

    public Double getLongitude() {
        return lastLongitude;
    }

    public void setLastLongitude(Double lastLongitude) {
        this.lastLongitude = lastLongitude;
    }

    public Set<Intervention> getInterventions() {
        return interventions;
    }

    public void setInterventions(Set<Intervention> interventions) {
        this.interventions = interventions;
    }

    public Double getLastLongitude() {
        return lastLongitude;
    }
}