package com.norsys.backend.service;

import com.norsys.backend.dto.DashboardData;
import com.norsys.backend.dto.DocumentInfo;
import com.norsys.backend.dto.DocumentStats;
import com.norsys.backend.repository.DocumentRepository;
import com.norsys.backend.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    public DashboardData getDashboardData(Long userId) {
        System.out.println("Getting dashboard data for user: " + userId);

        // Compter les différents types de documents
        long myProjectDocuments = documentRepository.countDocumentsInUserProjects(userId);
        long myTeamDocuments = documentRepository.countDocumentsInUserTeams(userId);
        long sharedDocuments = permissionRepository.countDocumentsSharedByUser(userId);
        long documentsSharedWithMe = permissionRepository.countDocumentsSharedWithUser(userId);

        System.out.println("Document counts - Projects: " + myProjectDocuments +
                ", Teams: " + myTeamDocuments +
                ", Shared: " + sharedDocuments +
                ", SharedWithMe: " + documentsSharedWithMe);

        // Récupérer les documents récents
        List<DocumentInfo> recentDocs = documentRepository.findTop5ByOwnerIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(doc -> new DocumentInfo(
                        doc.getTitre(), // title
                        doc.getCreatedAt().toString() // date
                ))
                .collect(Collectors.toList());

        System.out.println("Recent documents count: " + recentDocs.size());

        // Générer les activités récentes
        List<String> activities = recentDocs.stream()
                .map(doc -> "Ajout du document : " + doc.getTitle())
                .collect(Collectors.toList());

        // Récupérer les statistiques de documents
        List<DocumentStats> documentStats = getDocumentStats(userId);

        // Créer et retourner l'objet DashboardData complet
        DashboardData dashboardData = new DashboardData();
        dashboardData.setMyProjectDocuments(myProjectDocuments);
        dashboardData.setMyTeamDocuments(myTeamDocuments);
        dashboardData.setSharedDocuments(sharedDocuments);
        dashboardData.setDocumentsSharedWithMe(documentsSharedWithMe);
        dashboardData.setRecentDocuments(recentDocs);
        dashboardData.setRecentActivities(activities);
        dashboardData.setDocumentStats(documentStats);

        System.out.println("Dashboard data prepared successfully");
        return dashboardData;
    }

    @Transactional(readOnly = true)
    public List<DocumentStats> getDocumentStats(Long userId) {
        return documentRepository.countDocumentsByDateForUser(userId).stream()
                .map(stat -> {
                    DocumentStats documentStat = new DocumentStats();
                    documentStat.setDate(Timestamp.valueOf(stat.getDate().toString()));
                    documentStat.setDocumentCount(stat.getDocumentCount());
                    return documentStat;
                })
                .collect(Collectors.toList());
    }
}