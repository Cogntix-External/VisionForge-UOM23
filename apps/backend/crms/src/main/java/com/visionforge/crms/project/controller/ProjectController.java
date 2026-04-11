package com.visionforge.crms.project.controller;

import com.visionforge.crms.project.dto.ProjectResponse;
import com.visionforge.crms.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ProjectController {

    private final ProjectService projectService;

    // ── GET /api/company/projects ───────────────────────────────────
    @GetMapping("/company/projects")
    public ResponseEntity<List<ProjectResponse>> getCompanyProjects(
            @RequestHeader("X-Company-Id") String companyId
    ) {
        return ResponseEntity.ok(
            projectService.getProjectsByCompany(companyId)
        );
    }

    // ── GET /api/projects/{id} ──────────────────────────────────────
    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }
     @GetMapping("/client/projects")
    public ResponseEntity<List<ProjectResponse>> getClientProjects() {
        return ResponseEntity.ok(projectService.getProjectsForCurrentClient());
    }

    
}
