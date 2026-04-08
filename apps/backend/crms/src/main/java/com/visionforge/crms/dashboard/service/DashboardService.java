package com.visionforge.crms.dashboard.service;

import com.visionforge.crms.dashboard.dto.CompanyDashboardResponse;
import com.visionforge.crms.dashboard.dto.CompanyDashboardResponse.ProjectTableRow;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.proposal.model.Proposal;
import com.visionforge.crms.proposal.model.ProposalStatus;
import com.visionforge.crms.proposal.repository.ProposalRepository;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProposalRepository proposalRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public CompanyDashboardResponse getCompanyDashboard(String companyId) {

        // ── Proposals ───────────────────────────────────────────────
        List<Proposal> proposals = proposalRepository
                .findByCompanyId(companyId);

        long totalProposals = proposals.size();

        long pendingApprovals = proposals.stream()
                .filter(p -> p.getStatus() ==
                        ProposalStatus.PENDING)
                .count();

        long acceptedProposals = proposals.stream()
                .filter(p -> p.getStatus() ==
                        ProposalStatus.ACCEPTED)
                .count();

        long rejectedProposals = proposals.stream()
                .filter(p -> p.getStatus() ==
                        ProposalStatus.REJECTED)
                .count();

        // ── Projects ────────────────────────────────────────────────
        List<Project> projects = projectRepository
                .findByCompanyId(companyId);

        long totalProjects = projects.size();

        long activeProjects = projects.stream()
                .filter(p -> p.getStatus() ==
                        Project.ProjectStatus.ACTIVE)
                .count();

        // ── Fetch User Names ─────────────────────────────────────────
        Map<String, String> userNameMap = userRepository
                .findAllById(
                    projects.stream()
                        .map(Project::getCompanyId)
                        .distinct()
                        .collect(Collectors.toList())
                )
                .stream()
                .collect(Collectors.toMap(
                    User::getId,
                    User::getName
                ));

        // ── Table Rows ───────────────────────────────────────────────
        DateTimeFormatter formatter = DateTimeFormatter
                .ofPattern("yyyy-MM-dd");

        List<ProjectTableRow> recentProjects = projects.stream()
                .map(p -> ProjectTableRow.builder()
                        .id(p.getId())
                        .projectName(p.getName())
                        .status(p.getStatus().name())
                        .owner(userNameMap.getOrDefault(
                            p.getCompanyId(), "Unknown"
                        ))
                        .lastUpdated(
                            p.getUpdatedAt() != null
                                ? p.getUpdatedAt().format(formatter)
                                : p.getCreatedAt().format(formatter)
                        )
                        .build())
                .collect(Collectors.toList());

        return CompanyDashboardResponse.builder()
                .totalProjects(totalProjects)
                .pendingApprovals(pendingApprovals)
                .totalProposals(totalProposals)
                .acceptedProposals(acceptedProposals)
                .rejectedProposals(rejectedProposals)
                .activeProjects(activeProjects)
                .recentProjects(recentProjects)
                .build();
    }
}