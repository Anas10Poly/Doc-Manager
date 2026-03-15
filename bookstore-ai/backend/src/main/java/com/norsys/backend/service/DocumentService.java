package com.norsys.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.norsys.backend.dto.DocumentDTO;
import com.norsys.backend.dto.ShareDTO;
import com.norsys.backend.dto.mapper.DocumentMapper;
import com.norsys.backend.model.*;
import com.norsys.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    @Autowired private DocumentRepository documentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private TeamRepository teamRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PermissionRepository permissionRepository;
    @Autowired private SftpService sftpService;

    @Value("${sftp.upload.directory:/upload}")
    private String sftpUploadDirectory;

    private final Path fileStorageLocation;

    public DocumentService(DocumentRepository documentRepository, UserRepository userRepository,  OllamaService ollamaService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.ollamaService = ollamaService;
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    // Ajoutez cette injection
    @Autowired
    private OllamaService ollamaService;

    // Ajoutez cette méthode
    public String generateAIDescription(String fileName, String fileType, String userPrompt) {
        try {
            return ollamaService.generateDocumentDescription(fileName, fileType, userPrompt);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération de la description : " + e.getMessage());
        }
    }

    @Transactional
    public void saveDocument(
            String titre,
            String description,
            String typeFichier,
            Long ownerId,
            Long projectId,
            Long teamId,
            String sharedWithJson,
            MultipartFile file
    ) throws Exception {

        if (file == null || file.isEmpty()) {
            throw new Exception("Fichier manquant.");
        }

        String mimeType = file.getContentType();
        if (!isMimeMatchingFormat(mimeType, typeFichier)) {
            throw new Exception("Le type du fichier (" + mimeType + ") ne correspond pas au format indiqué (" + typeFichier + ").");
        }

        String safeTitle = titre.replaceAll("[^a-zA-Z0-9-_\\.]", "_");
        String filename = safeTitle + "." + typeFichier;

        // Upload vers serveur SFTP
        sftpService.uploadFile(sftpUploadDirectory, filename, file.getInputStream());

        Document document = new Document();
        document.setTitre(titre);
        document.setDescription(description);
        document.setTypeFichier(typeFichier);
        document.setPathFichier(filename);

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new Exception("Utilisateur propriétaire non trouvé."));
        document.setOwner(owner);

        if (projectId != null && teamId != null) {
            throw new Exception("Seul projectId ou teamId doit être renseigné, pas les deux.");
        }

        if (projectId != null) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new Exception("Projet non trouvé."));
            document.setProject(project);
        } else if (teamId != null) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new Exception("Équipe non trouvée."));
            document.setTeam(team);
        } else {
            throw new Exception("Vous devez fournir soit projectId soit teamId.");
        }

        Document savedDocument = documentRepository.save(document);

        if (sharedWithJson != null && !sharedWithJson.isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            List<ShareDTO> sharedWithList = mapper.readValue(sharedWithJson, new TypeReference<List<ShareDTO>>() {});
            for (ShareDTO share : sharedWithList) {
                User user = userRepository.findById(share.getUserId())
                        .orElseThrow(() -> new Exception("Utilisateur partagé non trouvé (id=" + share.getUserId() + ")"));
                Role role = roleRepository.findById(share.getRoleId())
                        .orElseThrow(() -> new Exception("Rôle non trouvé (id=" + share.getRoleId() + ")"));

                Permission permission = new Permission();
                permission.setUser(user);
                permission.setDocument(savedDocument);
                permission.setRole(role);

                permissionRepository.save(permission);
            }
        }
    }

    public void delete(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        try {
            sftpService.deleteFile(sftpUploadDirectory, document.getPathFichier());
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la suppression du fichier SFTP: " + e.getMessage(), e);
        }

        documentRepository.deleteById(id);
    }

    public Resource downloadDocument(Long id) throws Exception {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        String filename = document.getPathFichier();
        InputStream inputStream = sftpService.downloadFile(sftpUploadDirectory, filename);

        if (inputStream == null) {
            throw new RuntimeException("Fichier non trouvé sur le serveur SFTP: " + filename);
        }

        return new InputStreamResource(inputStream);
    }

    public boolean isMimeMatchingFormat(String mimeType, String format) {
        if (format == null || mimeType == null) return false;

        // Si le format est déjà un type MIME, comparez directement
        if (mimeType.equals(format)) return true;

        switch (format.toLowerCase()) {
            case "pdf":
                return "application/pdf".equals(mimeType);
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(mimeType);
            case "pptx":
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation".equals(mimeType);
            case "xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equals(mimeType);
            case "csv":
                return "text/csv".equals(mimeType) ||
                        "application/csv".equals(mimeType) ||
                        "text/plain".equals(mimeType);
            default:
                return false;
        }
    }


    @Transactional
    public void updateDocument(
            Long id,
            String titre,
            String description,
            String typeFichier,
            Long projectId,
            Long teamId,
            String sharedWithJson,
            MultipartFile file
    ) throws Exception {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new Exception("Document non trouvé (id=" + id + ")"));

        document.setTitre(titre);
        document.setDescription(description);
        document.setTypeFichier(typeFichier);

        if (file != null && !file.isEmpty()) {
            String safeTitle = titre.replaceAll("[^a-zA-Z0-9-_\\.]", "_");
            String filename = safeTitle + "." + typeFichier;

            sftpService.uploadFile(sftpUploadDirectory, filename, file.getInputStream());
            document.setPathFichier(filename);
        }

        if (projectId != null && teamId != null) {
            throw new Exception("Seul projectId ou teamId doit être renseigné, pas les deux.");
        }
        if (projectId != null) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new Exception("Projet non trouvé."));
            document.setProject(project);
            document.setTeam(null);
        } else if (teamId != null) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new Exception("Équipe non trouvée."));
            document.setTeam(team);
            document.setProject(null);
        }

        if (sharedWithJson != null && !sharedWithJson.isEmpty()) {
            permissionRepository.deleteByDocumentId(id);
            ObjectMapper mapper = new ObjectMapper();
            List<ShareDTO> sharedWithList = mapper.readValue(sharedWithJson, new TypeReference<List<ShareDTO>>() {});
            for (ShareDTO share : sharedWithList) {
                Permission permission = new Permission();
                permission.setUser(userRepository.findById(share.getUserId())
                        .orElseThrow(() -> new Exception("Utilisateur partagé non trouvé")));
                permission.setDocument(document);
                permission.setRole(roleRepository.findById(share.getRoleId())
                        .orElseThrow(() -> new Exception("Rôle non trouvé")));
                permissionRepository.save(permission);
            }
        }

        documentRepository.save(document);
    }

    public List<Document> getAll() {
        return documentRepository.findAll();
    }

    public List<DocumentDTO> getAllDTOs() {
        return documentRepository.findAll().stream()
                .map(DocumentMapper::toDTO)
                .collect(Collectors.toList());
    }


    public Optional<Document> getById(Long id) {
        return documentRepository.findById(id);
    }

    public Optional<DocumentDTO> getDTOById(Long id) {
        return documentRepository.findById(id)
                .map(DocumentMapper::toDTOWithPermissions);
    }

    public List<DocumentDTO> findByTitreContaining(String keyword) {
        return documentRepository.findByTitreContainingIgnoreCase(keyword)
                .stream()
                .map(DocumentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<DocumentDTO> findByTypeFichier(String typeFichier) {
        return documentRepository.findByTypeFichierIgnoreCase(typeFichier)
                .stream()
                .map(DocumentMapper::toDTO)
                .collect(Collectors.toList());
    }
}
