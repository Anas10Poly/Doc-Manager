package com.norsys.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class DocumentRequestDTO {
    private String titre;
    private String description;
    private String format; // pdf, docx, etc.
    private Long ownerId;
    private Long projectId;
    private Long teamId;
    private List<ShareDTO> sharedWith;
    private MultipartFile fichier;
}