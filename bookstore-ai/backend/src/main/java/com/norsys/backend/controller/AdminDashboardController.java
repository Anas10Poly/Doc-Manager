
package com.norsys.backend.controller;

import com.norsys.backend.dto.AdminDashboardStats;
import com.norsys.backend.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @GetMapping
    public AdminDashboardStats getAdminDashboardStats() {
        return adminDashboardService.getAdminDashboardStats();
    }
}