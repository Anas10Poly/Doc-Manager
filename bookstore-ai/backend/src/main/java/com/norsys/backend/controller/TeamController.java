package com.norsys.backend.controller;

import com.norsys.backend.dto.TeamDTO;
import com.norsys.backend.model.Team;
import com.norsys.backend.model.TeamMember;
import com.norsys.backend.model.User;
import com.norsys.backend.repository.TeamRepository;
import com.norsys.backend.repository.UserRepository;
import com.norsys.backend.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamService teamService;

    // Lister toutes les équipes avec leurs membres
    @GetMapping
    public List<TeamDTO> getAllTeams() {
        return teamService.getAllTeamDTOs();
    }

    // Récupérer les équipes d'un utilisateur spécifique
    @GetMapping("/user/{userId}")
    public List<TeamDTO> getUserTeams(@PathVariable Long userId) {
        return teamService.getUserTeamDTOs(userId);
    }

    // Récupérer les équipes de l'utilisateur connecté
    @GetMapping("/my-teams")
    public List<TeamDTO> getMyTeams() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return teamService.getUserTeamDTOs(user.getId());
    }

    // Créer une équipe simple
    @PostMapping
    public TeamDTO createTeam(@RequestBody TeamDTO teamDTO) {
        Team team = new Team();
        team.setName(teamDTO.getName());
        team.setDescription(teamDTO.getDescription());

        if (teamDTO.getUserIds() != null) {
            for (Long userId : teamDTO.getUserIds()) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + userId));
                TeamMember member = new TeamMember();
                member.setTeam(team);
                member.setUser(user);
                team.getMembers().add(member);
            }
        }

        team = teamRepository.save(team);
        return teamService.toDTO(team);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeam(@PathVariable Long id) {
        try {
            teamRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la suppression");
        }
    }

    // Modifier une équipe existante
    @PutMapping("/{id}")
    public ResponseEntity<TeamDTO> updateTeam(@PathVariable Long id, @RequestBody TeamDTO teamDTO) {
        try {
            Team existingTeam = teamRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Équipe non trouvée avec l'ID: " + id));

            // Mettre à jour les champs de base
            existingTeam.setName(teamDTO.getName());
            existingTeam.setDescription(teamDTO.getDescription());

            // Gestion des membres
            if (teamDTO.getUserIds() != null) {
                // Vider les membres existants
                existingTeam.getMembers().clear();

                // Ajouter les nouveaux membres
                for (Long userId : teamDTO.getUserIds()) {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + userId));
                    TeamMember member = new TeamMember();
                    member.setTeam(existingTeam);
                    member.setUser(user);
                    existingTeam.getMembers().add(member);
                }
            }

            Team updatedTeam = teamRepository.save(existingTeam);
            return ResponseEntity.ok(teamService.toDTO(updatedTeam));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    // Récupérer une équipe par son ID
    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeamById(@PathVariable Long id) {
        try {
            Team team = teamRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Équipe non trouvée avec l'ID: " + id));
            return ResponseEntity.ok(teamService.toDTO(team));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}