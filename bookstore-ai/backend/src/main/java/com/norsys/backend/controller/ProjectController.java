package com.norsys.backend.controller;

import com.norsys.backend.dto.ProjectDTO;
import com.norsys.backend.model.Project;
import com.norsys.backend.model.ProjectMember;
import com.norsys.backend.model.User;
import com.norsys.backend.repository.ProjectRepository;
import com.norsys.backend.repository.UserRepository;
import com.norsys.backend.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectService projectService;

    // Lister tous les projets avec leurs membres
    @GetMapping
    public List<ProjectDTO> getAllProjects() {
        return projectService.getAllProjectDTOs();
    }

    // Récupérer les projets d'un utilisateur spécifique
    @GetMapping("/user/{userId}")
    public List<ProjectDTO> getUserProjects(@PathVariable Long userId) {
        return projectService.getUserProjectDTOs(userId);
    }

    // Récupérer les projets de l'utilisateur connecté
    @GetMapping("/my-projects")
    public List<ProjectDTO> getMyProjects() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return projectService.getUserProjectDTOs(user.getId());
    }

    // Créer un projet simple
    @PostMapping
    public ProjectDTO createProject(@RequestBody ProjectDTO projectDTO) {
        Project project = new Project();
        project.setName(projectDTO.getName());
        project.setDescription(projectDTO.getDescription());

        if (projectDTO.getStartDate() != null && !projectDTO.getStartDate().isBlank()) {
            project.setStartDate(LocalDate.parse(projectDTO.getStartDate()));
        }
        if (projectDTO.getEndDate() != null && !projectDTO.getEndDate().isBlank()) {
            project.setEndDate(LocalDate.parse(projectDTO.getEndDate()));
        }

        if (projectDTO.getUserIds() != null) {
            for (Long userId : projectDTO.getUserIds()) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + userId));
                ProjectMember member = new ProjectMember();
                member.setProject(project);
                member.setUser(user);
                project.getMembers().add(member);
            }
        }

        project = projectRepository.save(project);
        return projectService.toDTO(project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        try {
            projectRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la suppression");
        }
    }

    // Modifier un projet existant
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id, @RequestBody ProjectDTO projectDTO) {
        try {
            Project existingProject = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'ID: " + id));

            // Mettre à jour les champs de base
            existingProject.setName(projectDTO.getName());
            existingProject.setDescription(projectDTO.getDescription());

            if (projectDTO.getStartDate() != null && !projectDTO.getStartDate().isBlank()) {
                existingProject.setStartDate(LocalDate.parse(projectDTO.getStartDate()));
            } else {
                existingProject.setStartDate(null);
            }

            if (projectDTO.getEndDate() != null && !projectDTO.getEndDate().isBlank()) {
                existingProject.setEndDate(LocalDate.parse(projectDTO.getEndDate()));
            } else {
                existingProject.setEndDate(null);
            }

            // Gestion des membres
            if (projectDTO.getUserIds() != null) {
                // Vider les membres existants
                existingProject.getMembers().clear();

                // Ajouter les nouveaux membres
                for (Long userId : projectDTO.getUserIds()) {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + userId));
                    ProjectMember member = new ProjectMember();
                    member.setProject(existingProject);
                    member.setUser(user);
                    existingProject.getMembers().add(member);
                }
            }

            Project updatedProject = projectRepository.save(existingProject);
            return ResponseEntity.ok(projectService.toDTO(updatedProject));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    // Récupérer un projet par son ID
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id) {
        try {
            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'ID: " + id));
            return ResponseEntity.ok(projectService.toDTO(project));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}