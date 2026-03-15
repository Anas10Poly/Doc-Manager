package com.norsys.backend.service;

import com.norsys.backend.dto.CreateUserDTO;
import com.norsys.backend.model.Project;
import com.norsys.backend.model.ProjectMember;
import com.norsys.backend.model.Team;
import com.norsys.backend.model.TeamMember;
import com.norsys.backend.model.User;
import com.norsys.backend.repository.ProjectMemberRepository;
import com.norsys.backend.repository.ProjectRepository;
import com.norsys.backend.repository.TeamMemberRepository;
import com.norsys.backend.repository.TeamRepository;
import com.norsys.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(CreateUserDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé.");
        }

        User user = new User();
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setAdmin(false);

        User savedUser = userRepository.save(user);

        affecterTeams(savedUser, dto.getTeamIds());
        affecterProjects(savedUser, dto.getProjectIds());

        return savedUser;
    }

    @Transactional
    public User updateUser(Long userId, CreateUserDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId));

        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setEmail(dto.getEmail());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        userRepository.save(user);

        supprimerAffectations(user);
        affecterTeams(user, dto.getTeamIds());
        affecterProjects(user, dto.getProjectIds());

        return userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Erreur lors du rechargement de l'utilisateur"));
    }

    /**  Affectation des équipes */
    private void affecterTeams(User user, List<Long> teamIds) {
        if (teamIds != null && !teamIds.isEmpty()) {
            Set<Long> uniqueTeamIds = new HashSet<>(teamIds);
            for (Long teamId : uniqueTeamIds) {
                Team team = teamRepository.findById(teamId)
                        .orElseThrow(() -> new RuntimeException("Équipe non trouvée: " + teamId));
                TeamMember tm = new TeamMember();
                tm.setUser(user);
                tm.setTeam(team);
                teamMemberRepository.save(tm);
            }
        }
    }

    /**  Affectation des projets */
    private void affecterProjects(User user, List<Long> projectIds) {
        if (projectIds != null && !projectIds.isEmpty()) {
            Set<Long> uniqueProjectIds = new HashSet<>(projectIds);
            for (Long projectId : uniqueProjectIds) {
                Project project = projectRepository.findById(projectId)
                        .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + projectId));
                ProjectMember pm = new ProjectMember();
                pm.setUser(user);
                pm.setProject(project);
                projectMemberRepository.save(pm);
            }
        }
    }

    /**  Suppression des anciennes affectations */
    private void supprimerAffectations(User user) {
        teamMemberRepository.deleteByUser(user);
        projectMemberRepository.deleteByUser(user);
    }
}
