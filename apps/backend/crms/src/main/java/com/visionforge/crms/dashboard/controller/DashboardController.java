package com.visionforge.crms.dashboard.controller;

import com.visionforge.crms.dashboard.dto.ClientDashboardResponse;
import com.visionforge.crms.dashboard.dto.CompanyDashboardResponse;
import com.visionforge.crms.dashboard.service.DashboardService;
import com.visionforge.crms.user.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    @GetMapping("/client/dashboard")
    public ResponseEntity<ClientDashboardResponse> getClientDashboard() {
        String clientId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(dashboardService.getClientDashboard(clientId));
    }

    @GetMapping("/company/dashboard")
    public ResponseEntity<CompanyDashboardResponse> getCompanyDashboard() {
        String companyId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(dashboardService.getCompanyDashboard(companyId));
    }
}