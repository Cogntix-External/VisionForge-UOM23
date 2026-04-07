package com.visionforge.crms.dashboard.controller;

import com.visionforge.crms.dashboard.dto.CompanyDashboardResponse;
import com.visionforge.crms.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    // ── GET /api/company/dashboard ──────────────────────────────────
    @GetMapping("/company/dashboard")
    public ResponseEntity<CompanyDashboardResponse> getCompanyDashboard(
            @RequestHeader("X-Company-Id") String companyId
    ) {
        return ResponseEntity.ok(
            dashboardService.getCompanyDashboard(companyId)
        );
    }
}