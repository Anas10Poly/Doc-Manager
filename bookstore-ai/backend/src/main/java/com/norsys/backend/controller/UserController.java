package com.norsys.backend.controller;

import com.norsys.backend.dto.CreateUserDTO;
import com.norsys.backend.dto.ProjectDTO;
import com.norsys.backend.dto.TeamDTO;
import com.norsys.backend.dto.UserDTO;
import com.norsys.backend.model.User;
import com.norsys.backend.repository.UserRepository;
import com.norsys.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody CreateUserDTO dto) {
        User createdUser = userService.createUser(dto);
        return ResponseEntity.ok("Collaborateur créé avec succès, id: " + createdUser.getId());
    }

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("Utilisateur supprimé");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody CreateUserDTO dto) {
        userService.updateUser(id, dto);
        return ResponseEntity.ok("Utilisateur mis à jour");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));
        return ResponseEntity.ok(mapToDTO(user));
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getPrenom());
        dto.setLastName(user.getNom());
        dto.setEmail(user.getEmail());

        // Équipes distinctes
        List<TeamDTO> teamDTOs = user.getTeamMemberships().stream()
                .map(tm -> tm.getTeam())
                .distinct()
                .map(team -> {
                    TeamDTO t = new TeamDTO();
                    t.setId(team.getId());
                    t.setName(team.getName());
                    return t;
                })
                .collect(Collectors.toList());
        dto.setTeams(teamDTOs);

        // Projets distincts
        List<ProjectDTO> projectDTOs = user.getProjectMemberships().stream()
                .map(pm -> pm.getProject())
                .distinct()
                .map(project -> {
                    ProjectDTO p = new ProjectDTO();
                    p.setId(project.getId());
                    p.setName(project.getName());
                    return p;
                })
                .collect(Collectors.toList());
        dto.setProjects(projectDTOs);

        return dto;
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long userId, @RequestBody Map<String, Object> updates) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId));

            // Mettre à jour les champs de base
            if (updates.containsKey("firstName")) {
                user.setPrenom((String) updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                user.setNom((String) updates.get("lastName"));
            }
            if (updates.containsKey("email")) {
                user.setEmail((String) updates.get("email"));
            }

            // Mettre à jour le mot de passe si fourni
            if (updates.containsKey("password")) {
                String newPassword = (String) updates.get("password");
                user.setPassword(passwordEncoder.encode(newPassword));
            }

            userRepository.save(user);
            return ResponseEntity.ok("Profil mis à jour avec succès");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour: " + e.getMessage());
        }
    }
}
