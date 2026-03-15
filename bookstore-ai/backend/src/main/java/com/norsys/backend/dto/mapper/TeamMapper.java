package com.norsys.backend.dto.mapper;

import com.norsys.backend.dto.TeamDTO;
import com.norsys.backend.dto.UserDTO;
import com.norsys.backend.model.Team;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class TeamMapper {
    public TeamDTO toDTO(Team team) {
        if (team == null) return null;

        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());

        // Mapper les membres
        dto.setMembers(
                team.getMembers().stream()
                        .map(tm -> {
                            UserDTO u = new UserDTO();
                            u.setId(tm.getUser().getId());
                            u.setPrenom(tm.getUser().getPrenom());
                            u.setNom(tm.getUser().getNom());
                            u.setEmail(tm.getUser().getEmail());
                            return u;
                        })
                        .collect(Collectors.toList())
        );
        dto.setUserIds(
                team.getMembers().stream()
                        .map(tm -> tm.getUser().getId())
                        .collect(Collectors.toList())
        );

        return dto;
    }
}

