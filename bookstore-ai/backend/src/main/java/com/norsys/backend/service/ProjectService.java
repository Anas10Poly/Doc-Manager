package com.norsys.backend.service;

import com.norsys.backend.dto.ProjectDTO;
import com.norsys.backend.model.Project;
import com.norsys.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<ProjectDTO> getAllProjectDTOs() {
        return projectRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getUserProjectDTOs(Long userId) {
        return projectRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProjectDTO toDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());

        if (project.getStartDate() != null) {
            dto.setStartDate(project.getStartDate().toString());
        }
        if (project.getEndDate() != null) {
            dto.setEndDate(project.getEndDate().toString());
        }

        // Ajouter les IDs des membres
        if (project.getMembers() != null) {
            List<Long> userIds = project.getMembers().stream()
                    .map(member -> member.getUser().getId())
                    .collect(Collectors.toList());
            dto.setUserIds(userIds);
        }

        return dto;
    }

}