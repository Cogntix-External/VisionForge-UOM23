package com.visionforge.crms.project.service;

import com.visionforge.crms.changerequest.dto.ChangeRequestResponse;
import com.visionforge.crms.changerequest.model.ChangeRequest;
import com.visionforge.crms.changerequest.repository.ChangeRequestRepository;
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

    // 🔥 ADD THIS
    private final ChangeRequestRepository changeRequestRepository;

    // Auto create project from accepted proposal
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
                            .budget(proposal.getTotalBudget() != null ? proposal.getTotalBudget() : 0.0)
                            .timeline(proposal.getTotalDurationDays() != null
                                    ? proposal.getTotalDurationDays() + " days"
                                    : "Not defined")
                            .progress(0)
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

    // Company side
    public List<ProjectResponse> getProjectsByCompany(String companyId) {
        return projectRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Common
    public ProjectResponse getProjectById(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        return mapToResponse(project);
    }

    // Client side
    public List<ProjectResponse> getProjectsForCurrentClient() {
        if (currentUserService.getCurrentUserRole() != Role.CLIENT) {
            throw new RuntimeException("Only client can view client projects");
        }

        String clientId = currentUserService.getCurrentUserId();

        List<Project> projects = projectRepository.findByClientId(clientId);

        return projects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProjectResponse getCurrentClientProjectById(String projectId) {
        if (currentUserService.getCurrentUserRole() != Role.CLIENT) {
            throw new RuntimeException("Only client can view project details");
        }

        String clientId = currentUserService.getCurrentUserId();

        Project project = projectRepository.findByIdAndClientId(projectId, clientId)
                .orElseThrow(() -> new RuntimeException("Project not found for this client"));

        return mapToResponse(project);
    }

    public String getCurrentUserId() {
        return currentUserService.getCurrentUserId();
    }

    // 🔥 MAIN FIX HERE
    private ProjectResponse mapToResponse(Project project) {

        // 👉 get change requests for this project
        List<ChangeRequest> crs = changeRequestRepository.findByProjectId(project.getId());

        List<ChangeRequestResponse> crResponses = crs.stream()
                .map(cr -> ChangeRequestResponse.builder()
                        .id(cr.getId())
                        .projectId(cr.getProjectId())
                        .title(cr.getTitle())
                        .description(cr.getDescription())
                        .status(cr.getStatus())
                        .createdAt(cr.getCreatedAt())
                        .date(cr.getCreatedAt() != null
                                ? cr.getCreatedAt().toLocalDate().toString()
                                : "N/A")
                        .build()
                )
                .collect(Collectors.toList());

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .proposalId(project.getProposalId())
                .clientId(project.getClientId())
                .clientName(project.getClientName())
                .companyId(project.getCompanyId())
                .status(project.getStatus())
                .budget(project.getBudget())
                .timeline(project.getTimeline())
                .progress(project.getProgress())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())

                // 🔥 THIS LINE FIX EVERYTHING
                .changeRequests(crResponses)

                .build();
    }
}