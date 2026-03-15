
package com.norsys.backend.dto;

import com.norsys.backend.model.Document;
import com.norsys.backend.model.User;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AdminDashboardStats {
    private long totalDocuments;
    private long totalUsers;
    private long totalProjects;
    private long totalTeams;
    private List<Document> recentDocuments;
    private List<User> recentUsers;
    private Map<String, Long> documentTypeStats;
}