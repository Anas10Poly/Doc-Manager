package com.norsys.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateUserDTO {
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private List<Long> teamIds;
    private List<Long> projectIds;
}
