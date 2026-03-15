package com.norsys.backend.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DashboardData {
    private long myProjectDocuments;       // documents dans projets où l'utilisateur est membre
    private long myTeamDocuments;          // documents dans équipes où l'utilisateur est membre
    private long sharedDocuments;          // documents partagés par l'utilisateur
    private long documentsSharedWithMe;   // documents partagés avec l'utilisateur
    private List<DocumentInfo> recentDocuments;
    private List<String> recentActivities;
    private List<DocumentStats> documentStats; // Ajoutez ce champ
    private Map<String, Integer> documentTypeStats;
}
