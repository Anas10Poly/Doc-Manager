package com.norsys.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class TeamDTO {
    private Long id;
    private String name;        // nom de l'équipe
    private String description; // description de l'équipe
    private List<UserDTO> members;
    private List<Long> userIds;
}
