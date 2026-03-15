package com.norsys.backend.dto.mapper;

import com.norsys.backend.dto.DocumentDTO;
import com.norsys.backend.dto.UserDTO;
import com.norsys.backend.model.Document;
import com.norsys.backend.model.Project;
import com.norsys.backend.model.Team;
import com.norsys.backend.model.User;
import com.norsys.backend.model.Permission;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

public class DocumentMapper {

    // Méthode pour transformer une entité Document en DocumentDTO
    public static DocumentDTO toDTO(Document doc) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(doc.getId());
        dto.setTitre(doc.getTitre());
        dto.setDescription(doc.getDescription());
        dto.setTypeFichier(doc.getTypeFichier());
        dto.setPathFichier(doc.getPathFichier());
        dto.setCreatedAt(doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : null);

        // Mapping de l'utilisateur propriétaire
        if (doc.getOwner() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(doc.getOwner().getId());
            userDTO.setNom(doc.getOwner().getNom());
            userDTO.setPrenom(doc.getOwner().getPrenom());
            dto.setOwner(userDTO);
        }

        // Mapping du projet
        if (doc.getProject() != null) {
            dto.setProjectName(doc.getProject().getName());
            dto.setProjectId(doc.getProject().getId());
        }

        // Mapping de l'équipe
        if (doc.getTeam() != null) {
            dto.setTeamName(doc.getTeam().getName());
            dto.setTeamId(doc.getTeam().getId());
        }

        return dto;
    }

    // NOUVELLE MÉTHODE : DocumentDTO avec toutes les informations y compris les permissions
    public static DocumentDTO toDTOWithPermissions(Document doc) {
        DocumentDTO dto = toDTO(doc); // Utiliser la méthode existante comme base

        // Ajouter les informations de projet et équipe même avec @JsonIgnore
        Map<String, Object> project = null;
        Map<String, Object> team = null;

        if (doc.getProject() != null) {
            project = new HashMap<>();
            project.put("id", doc.getProject().getId());
            project.put("name", doc.getProject().getName());
        }

        if (doc.getTeam() != null) {
            team = new HashMap<>();
            team.put("id", doc.getTeam().getId());
            team.put("name", doc.getTeam().getName());
        }

        // Ajouter les permissions si elles existent
        List<Map<String, Object>> permissions = null;
        if (doc.getPermissions() != null && !doc.getPermissions().isEmpty()) {
            permissions = doc.getPermissions().stream()
                    .map(perm -> {
                        Map<String, Object> permMap = new HashMap<>();
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", perm.getUser().getId());
                        userMap.put("nom", perm.getUser().getNom());
                        userMap.put("prenom", perm.getUser().getPrenom());
                        userMap.put("email", perm.getUser().getEmail());

                        Map<String, Object> roleMap = new HashMap<>();
                        roleMap.put("id", perm.getRole().getId());
                        roleMap.put("name", perm.getRole().getName());

                        permMap.put("user", userMap);
                        permMap.put("role", roleMap);
                        return permMap;
                    })
                    .collect(Collectors.toList());
        }

        // Créer un DTO enrichi
        EnrichedDocumentDTO enrichedDto = new EnrichedDocumentDTO(dto);
        enrichedDto.setProject(project);
        enrichedDto.setTeam(team);
        enrichedDto.setPermissions(permissions);

        return enrichedDto;
    }

    // Méthode pour transformer un DocumentDTO en entité Document pour la mise à jour
    public static Document toEntity(DocumentDTO dto) {
        Document doc = new Document();
        doc.setId(dto.getId());
        doc.setTitre(dto.getTitre());
        doc.setDescription(dto.getDescription());
        doc.setTypeFichier(dto.getTypeFichier());
        doc.setPathFichier(dto.getPathFichier());

        // Le mappage de l'utilisateur propriétaire
        if (dto.getOwner() != null) {
            User owner = new User(); // Assurez-vous d'instancier correctement l'utilisateur
            owner.setId(dto.getOwner().getId());
            doc.setOwner(owner);
        }

        // Le mappage du projet
        if (dto.getProjectId() != null) {
            Project project = new Project(); // Assurez-vous d'instancier correctement le projet
            project.setId(dto.getProjectId());
            doc.setProject(project);
        }

        // Le mappage de l'équipe
        if (dto.getTeamId() != null) {
            Team team = new Team(); // Assurez-vous d'instancier correctement l'équipe
            team.setId(dto.getTeamId());
            doc.setTeam(team);
        }

        return doc;
    }

    // Méthode pour mettre à jour l'entité Document à partir d'un DocumentDTO (utilisé lors de la modification)
    public static void updateEntityFromDTO(DocumentDTO dto, Document doc) {
        if (dto.getTitre() != null) {
            doc.setTitre(dto.getTitre());
        }
        if (dto.getDescription() != null) {
            doc.setDescription(dto.getDescription());
        }
        if (dto.getTypeFichier() != null) {
            doc.setTypeFichier(dto.getTypeFichier());
        }
        if (dto.getPathFichier() != null) {
            doc.setPathFichier(dto.getPathFichier());
        }

        // Mettre à jour l'utilisateur propriétaire
        if (dto.getOwner() != null && dto.getOwner().getId() != null) {
            User owner = new User(); // Assurez-vous d'instancier correctement l'utilisateur
            owner.setId(dto.getOwner().getId());
            doc.setOwner(owner);
        }

        // Mettre à jour le projet
        if (dto.getProjectId() != null) {
            Project project = new Project(); // Assurez-vous d'instancier correctement le projet
            project.setId(dto.getProjectId());
            doc.setProject(project);
        }

        // Mettre à jour l'équipe
        if (dto.getTeamId() != null) {
            Team team = new Team(); // Assurez-vous d'instancier correctement l'équipe
            team.setId(dto.getTeamId());
            doc.setTeam(team);
        }
    }

    // Classe interne pour un DTO enrichi
    public static class EnrichedDocumentDTO extends DocumentDTO {
        private Map<String, Object> project;
        private Map<String, Object> team;
        private List<Map<String, Object>> permissions;

        public EnrichedDocumentDTO(DocumentDTO base) {
            this.setId(base.getId());
            this.setTitre(base.getTitre());
            this.setDescription(base.getDescription());
            this.setTypeFichier(base.getTypeFichier());
            this.setPathFichier(base.getPathFichier());
            this.setCreatedAt(base.getCreatedAt());
            this.setOwner(base.getOwner());
            this.setProjectName(base.getProjectName());
            this.setProjectId(base.getProjectId());
            this.setTeamName(base.getTeamName());
            this.setTeamId(base.getTeamId());
        }

        public Map<String, Object> getProject() { return project; }
        public void setProject(Map<String, Object> project) { this.project = project; }

        public Map<String, Object> getTeam() { return team; }
        public void setTeam(Map<String, Object> team) { this.team = team; }

        public List<Map<String, Object>> getPermissions() { return permissions; }
        public void setPermissions(List<Map<String, Object>> permissions) { this.permissions = permissions; }
    }
}