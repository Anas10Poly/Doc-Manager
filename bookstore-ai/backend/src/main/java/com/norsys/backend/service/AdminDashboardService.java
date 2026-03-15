package com.norsys.backend.service;

import com.norsys.backend.dto.AdminDashboardStats;
import com.norsys.backend.model.Document;
import com.norsys.backend.model.User;
import com.norsys.backend.repository.DocumentRepository;
import com.norsys.backend.repository.ProjectRepository;
import com.norsys.backend.repository.TeamRepository;
import com.norsys.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamRepository teamRepository;

    public AdminDashboardStats getAdminDashboardStats() {
        AdminDashboardStats stats = new AdminDashboardStats();

        setGlobalCounts(stats);
        setRecentDocuments(stats);
        setRecentUsers(stats);
        setDocumentTypeStats(stats);

        return stats;
    }

    private void setGlobalCounts(AdminDashboardStats stats) {
        stats.setTotalDocuments(documentRepository.countAllDocuments());
        stats.setTotalUsers(userRepository.countAllUsers());
        stats.setTotalProjects(projectRepository.count());
        stats.setTotalTeams(teamRepository.count());
    }

    private void setRecentDocuments(AdminDashboardStats stats) {
        List<Document> recentDocs = documentRepository.findTop5ByOrderByCreatedAtDesc();
        stats.setRecentDocuments(recentDocs);
    }

    private void setRecentUsers(AdminDashboardStats stats) {
        List<User> recentUsers = userRepository.findTop5ByOrderByCreatedAtDesc();
        stats.setRecentUsers(recentUsers);
    }

    private void setDocumentTypeStats(AdminDashboardStats stats) {
        List<Object[]> typeStats = documentRepository.countDocumentsByType();
        Map<String, Long> typeStatsMap = typeStats.stream()
                .collect(Collectors.toMap(
                        arr -> (String) arr[0],
                        arr -> (Long) arr[1]
                ));
        stats.setDocumentTypeStats(typeStatsMap);
    }

}