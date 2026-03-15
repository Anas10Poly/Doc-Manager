package com.norsys.backend.dto.mapper;

import com.norsys.backend.dto.ProjectDTO;
import com.norsys.backend.dto.UserDTO;
import com.norsys.backend.model.Project;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ProjectMapper {

    public ProjectDTO toDTO(Project project) {
        if (project == null) {
            return null;
        }
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());

        // ✅ Dates (optionnelles)
        if (project.getStartDate() != null) {
            dto.setStartDate(project.getStartDate().toString()); // format ISO-8601 (yyyy-MM-dd)
        }
        if (project.getEndDate() != null) {
            dto.setEndDate(project.getEndDate().toString());
        }

        // Membres
        dto.setMembers(project.getMembers().stream()
                .map(pm -> {
                    UserDTO u = new UserDTO();
                    u.setId(pm.getUser().getId());
                    u.setPrenom(pm.getUser().getPrenom());
                    u.setNom(pm.getUser().getNom());
                    u.setEmail(pm.getUser().getEmail());
                    return u;
                })
                .collect(Collectors.toList())
        );

        dto.setUserIds(
                project.getMembers().stream()
                        .map(pm -> pm.getUser().getId())
                        .collect(Collectors.toList())
        );

        return dto;
    }
}
