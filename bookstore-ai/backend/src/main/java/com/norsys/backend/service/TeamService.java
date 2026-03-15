package com.norsys.backend.service;

import com.norsys.backend.dto.TeamDTO;
import com.norsys.backend.model.Team;
import com.norsys.backend.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;

    public TeamService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    public List<TeamDTO> getAllTeamDTOs() {
        return teamRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TeamDTO> getUserTeamDTOs(Long userId) {
        return teamRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TeamDTO toDTO(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());

        // Ajouter les IDs des membres
        if (team.getMembers() != null) {
            List<Long> userIds = team.getMembers().stream()
                    .map(member -> member.getUser().getId())
                    .collect(Collectors.toList());
            dto.setUserIds(userIds);
        }

        return dto;
    }
}