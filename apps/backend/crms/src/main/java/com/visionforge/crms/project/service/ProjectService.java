package com.visionforge.crms.project.service;

import com.visionforge.crms.project.dto.ProjectResponse;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.proposal.model.Proposal;
import com.visionforge.crms.user.CurrentUserService;
import com.visionforge.crms.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUserService;

    // Auto Create Project from accepted proposal
    public ProjectResponse createProjectFromProposal(Proposal proposal) {
        if (proposal == null) {
            throw new RuntimeException("Proposal cannot be null");
        }

        return projectRepository.findByProposalId(proposal.getId())
                .map(this::mapToResponse)
                .orElseGet(() -> {
                    Project project = Project.builder()
                            .name(proposal.getTitle())
                            .description(proposal.getDescription())
                            .proposalId(proposal.getId())
                            .clientId(proposal.getClientId())
                            .clientName(proposal.getClientName())
                            .companyId(proposal.getCompanyId())
                            .status(Project.ProjectStatus.ACTIVE)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    return mapToResponse(projectRepository.save(project));
                });
    }

    public void ensureProjectExistsForProposal(Proposal proposal) {
        projectRepository.findByProposalId(proposal.getId())
                .ifPresentOrElse(
                        existing -> {},
                        () -> createProjectFromProposal(proposal)
                );
    }

    // Company: Get All Projects
    public List<ProjectResponse> getProjectsByCompany(String companyId) {
        if (currentUserService.getCurrentUserRole() == Role.COMPANY) {
            return projectRepository.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return projectRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get Single Project
    public ProjectResponse getProjectById(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                        "Project not found: " + projectId
                ));
        return mapToResponse(project);
    }

    // Client: Get Current Client Projects
    public List<ProjectResponse> getProjectsForCurrentClient() {
        String clientId = currentUserService.getCurrentUserId();

        List<Project> projects = projectRepository.findByClientId(clientId);

        return projects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public String getCurrentUserId() {
        return currentUserService.getCurrentUserId();
    }

    // Private Helper
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
