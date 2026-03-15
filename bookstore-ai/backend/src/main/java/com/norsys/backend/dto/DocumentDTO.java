package com.norsys.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class DocumentDTO {
    private Long id;
    private String titre;
    private String description;
    private String typeFichier;
    private String pathFichier;
    private String createdAt;
    private String ownerUsername;
    private String projectName;
    private String teamName;
    private UserDTO owner;
    private Long projectId;
    private Long teamId;
    private Map<String, Object> project;
    private Map<String, Object> team;
    private List<Map<String, Object>> permissions;
}