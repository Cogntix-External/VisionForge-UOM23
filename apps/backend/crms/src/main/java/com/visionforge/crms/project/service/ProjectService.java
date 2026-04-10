package com.visionforge.crms.project.service;

import com.visionforge.crms.project.dto.ProjectResponse;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.proposal.model.Proposal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    // ── Auto Create Project ─────────────────────────────────────────
    public ProjectResponse createProjectFromProposal(Proposal proposal) {
        projectRepository.findByProposalId(proposal.getId())
                .ifPresent(p -> {
                    throw new RuntimeException(
                        "Project already exists for this proposal"
                    );
                });

        Project project = Project.builder()
                .name(proposal.getTitle())
                .description(proposal.getDescription())
                .proposalId(proposal.getId())
                .clientId(proposal.getClientId())
            .clientName(proposal.getClientName())
                .companyId(proposal.getCompanyId())
                .build();

        return mapToResponse(projectRepository.save(project));
    }

    public void ensureProjectExistsForProposal(Proposal proposal) {
        projectRepository.findByProposalId(proposal.getId())
                .ifPresentOrElse(
                        existing -> {},
                        () -> createProjectFromProposal(proposal)
                );
    }

    // ── Company: Get All Projects ───────────────────────────────────
    public List<ProjectResponse> getProjectsByCompany(String companyId) {
        return projectRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Get Single Project ──────────────────────────────────────────
    public ProjectResponse getProjectById(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                    "Project not found: " + projectId
                ));
        return mapToResponse(project);
    }

    // ── Private Helper ──────────────────────────────────────────────
    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .proposalId(project.getProposalId())
                .clientId(project.getClientId())
                .clientName(project.getClientName())
                .companyId(project.getCompanyId())
                .status(project.getStatus())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}