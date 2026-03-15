package com.norsys.backend.controller;

import com.norsys.backend.dto.DashboardData;
import com.norsys.backend.dto.DocumentStats;
import com.norsys.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @Autowired
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardData getDashboardData(@RequestParam Long userId) {
        return dashboardService.getDashboardData(userId);
    }

    // Nouvel endpoint pour les stats
    @GetMapping("/stats")
    public List<DocumentStats> getDocumentStats(@RequestParam Long userId) {
        return dashboardService.getDocumentStats(userId);
    }
}
