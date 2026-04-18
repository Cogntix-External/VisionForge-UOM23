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
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;

    // Company side - get all company projects
    @GetMapping("/company/projects")
    public ResponseEntity<List<ProjectResponse>> getCompanyProjects(
            @RequestHeader("X-Company-Id") String companyId
    ) {
        return ResponseEntity.ok(projectService.getProjectsByCompany(companyId));
    }

    // Client side - get current logged-in client projects
    @GetMapping("/client/projects")
    public ResponseEntity<List<ProjectResponse>> getClientProjects() {
        return ResponseEntity.ok(projectService.getProjectsForCurrentClient());
    }

    // Client side - get single current client project
    @GetMapping("/client/projects/{id}")
    public ResponseEntity<ProjectResponse> getClientProjectById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(projectService.getCurrentClientProjectById(id));
    }

    // Common - get project by id
    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }
}