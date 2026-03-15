package com.norsys.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProjectDTO {
    private Long id;
    private String name;        // nom du projet
    private String description; // description du projet
    private String startDate;
    private String endDate;

    private List<UserDTO> members;
    private List<Long> userIds;
}
