package com.norsys.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;

    private List<TeamDTO> teams;
    private List<ProjectDTO> projects;

    // Alias pour compatibilité
    public String getPrenom() {
        return this.firstName;
    }

    public void setPrenom(String prenom) {
        this.firstName = prenom;
    }

    public String getNom() {
        return this.lastName;
    }

    public void setNom(String nom) {
        this.lastName = nom;
    }
}
