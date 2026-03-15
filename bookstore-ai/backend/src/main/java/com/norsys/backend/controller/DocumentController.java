package com.norsys.backend.controller;

import com.norsys.backend.dto.ProjectDTO;
import com.norsys.backend.dto.TeamDTO;
import com.norsys.backend.exception.DocumentNotFoundException;
import com.norsys.backend.model.Project;
import com.norsys.backend.model.Team;
import com.norsys.backend.repository.ProjectRepository;
import com.norsys.backend.repository.TeamRepository;
import com.norsys.backend.service.DocumentService;
import com.norsys.backend.dto.DocumentDTO;
import com.norsys.backend.model.Document;
import com.norsys.backend.service.ProjectService;
import com.norsys.backend.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    // Pour importer les projets et les équipes de la base de données avant l'implémentation de l'admin qui associe l'user à un projet ou une équipe
    private final ProjectService projectService;
    private final TeamService teamService;

    public DocumentController(DocumentService documentService, ProjectService projectService, TeamService teamService) {
        this.documentService = documentService;
        this.projectService = projectService;
        this.teamService = teamService;
    }

    @GetMapping("/projects")
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjectDTOs());
    }

    @GetMapping("/teams")
    public ResponseEntity<List<TeamDTO>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeamDTOs());
    }

    @PostMapping(value = "/add", consumes = "multipart/form-data")
    public ResponseEntity<String> addDocument(
            @RequestPart("file") MultipartFile file,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("format") String format,
            @RequestParam("ownerId") Long ownerId,
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "teamId", required = false) Long teamId,
            @RequestParam(value = "sharedWith", required = false) String sharedWithJson
    ) {
        try {
            documentService.saveDocument(titre, description, format, ownerId, projectId, teamId, sharedWithJson, file);
            return ResponseEntity.ok("Document uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<DocumentDTO>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDTOs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDTO> getDocumentById(@PathVariable Long id) {
        DocumentDTO dto = documentService.getDTOById(id)
                .orElseThrow(() -> new DocumentNotFoundException("Document non trouvé avec l'id : " + id));
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        try {
            Resource resource = documentService.downloadDocument(id);

            Document document = documentService.getById(id)
                    .orElseThrow(() -> new DocumentNotFoundException("Document non trouvé avec id " + id));

            String filename = document.getTitre().replaceAll("[^a-zA-Z0-9-_\\.]", "_") + "." + document.getTypeFichier();
            String fileExtension = document.getTypeFichier().toLowerCase();

            MediaType mediaType = MEDIA_TYPE_MAP.getOrDefault(fileExtension, MediaType.APPLICATION_OCTET_STREAM);

            // Ajouter l'extension si nécessaire
            if (!filename.toLowerCase().endsWith("." + fileExtension)) {
                String baseFilename = filename.contains(".") ?
                        filename.substring(0, filename.lastIndexOf(".")) : filename;
                filename = baseFilename + "." + fileExtension;
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header("Access-Control-Expose-Headers", "Content-Disposition")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header(HttpHeaders.EXPIRES, "0")
                    .body(resource);

        } catch (DocumentNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Map statique pour gérer les types MIME (remplace le switch)
    private static final Map<String, MediaType> MEDIA_TYPE_MAP = Map.ofEntries(
            Map.entry("pdf", MediaType.APPLICATION_PDF),
            Map.entry("docx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
            Map.entry("xlsx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")),
            Map.entry("pptx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation")),
            Map.entry("doc", MediaType.parseMediaType("application/msword")),
            Map.entry("xls", MediaType.parseMediaType("application/vnd.ms-excel")),
            Map.entry("csv", MediaType.parseMediaType("text/csv")),
            Map.entry("ppt", MediaType.parseMediaType("application/vnd.ms-powerpoint")),
            Map.entry("txt", MediaType.TEXT_PLAIN),
            Map.entry("jpg", MediaType.IMAGE_JPEG),
            Map.entry("jpeg", MediaType.IMAGE_JPEG),
            Map.entry("png", MediaType.IMAGE_PNG),
            Map.entry("gif", MediaType.IMAGE_GIF),
            Map.entry("zip", MediaType.parseMediaType("application/zip")),
            Map.entry("rar", MediaType.parseMediaType("application/x-rar-compressed"))
    );

    private MediaType getMediaTypeForFile(String fileExtension) {
        return MEDIA_TYPE_MAP.getOrDefault(fileExtension.toLowerCase(), MediaType.APPLICATION_OCTET_STREAM);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<DocumentDTO>> searchDocuments(@RequestParam String keyword) {
        return ResponseEntity.ok(documentService.findByTitreContaining(keyword));
    }
    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByType(@PathVariable String type) {
        return ResponseEntity.ok(documentService.findByTypeFichier(type));
    }

    @PostMapping("/generate-description")
    public ResponseEntity<String> generateDescription(
            @RequestParam("fileName") String fileName,
            @RequestParam("fileType") String fileType,
            @RequestParam(value = "userPrompt", required = false) String userPrompt) {

        try {
            String generatedDescription = documentService.generateAIDescription(fileName, fileType, userPrompt);
            return ResponseEntity.ok(generatedDescription);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la génération : " + e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<String> updateDocument(
            @PathVariable Long id,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("format") String format,
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "teamId", required = false) Long teamId,
            @RequestParam(value = "sharedWith", required = false) String sharedWithJson
    ) {
        try {
            documentService.updateDocument(id, titre, description, format, projectId, teamId, sharedWithJson, file);
            return ResponseEntity.ok("Document modifié avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }
}