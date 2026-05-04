package com.visionforge.crms.dashboard.service;

import com.visionforge.crms.dashboard.dto.ClientDashboardResponse;
import com.visionforge.crms.dashboard.dto.CompanyDashboardResponse;
import com.visionforge.crms.dashboard.dto.CompanyDashboardResponse.ProjectTableRow;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.proposal.model.Proposal;
import com.visionforge.crms.proposal.model.ProposalStatus;
import com.visionforge.crms.proposal.repository.ProposalRepository;
import com.visionforge.crms.changerequest.model.ChangeRequest;
import com.visionforge.crms.changerequest.model.ChangeRequestStatus;
import com.visionforge.crms.changerequest.repository.ChangeRequestRepository;
import com.visionforge.crms.kanban.model.KanbanTask;
import com.visionforge.crms.kanban.repository.KanbanTaskRepository;
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
    private final ChangeRequestRepository changeRequestRepository;
    private final KanbanTaskRepository kanbanTaskRepository;

    public ClientDashboardResponse getClientDashboard(String clientId) {
        List<Proposal> allClientProposals = proposalRepository.findByClientId(clientId);
        List<Project> allClientProjects = projectRepository.findByClientId(clientId);

        long pendingProposalsCount = allClientProposals.stream()
                .filter(p -> p.getStatus() != null && p.getStatus() == ProposalStatus.PENDING)
                .count();

        long acceptedProjectsCount = allClientProjects.size();

        List<ChangeRequest> allClientCRs = changeRequestRepository.findByClientId(clientId);
        long pendingChangeRequestsCount = allClientCRs.stream()
                .filter(cr -> cr.getStatus() == ChangeRequestStatus.PENDING)
                .count();
        long approvedChangeRequestsCount = allClientCRs.stream()
                .filter(cr -> cr.getStatus() == ChangeRequestStatus.ACCEPTED || cr.getStatus() == ChangeRequestStatus.IMPLEMENTED)
                .count();

        // Calculate Progress and Completion based on tasks
        int totalProgress = 0;
        int totalCompletion = 0;
        int projectCountWithTasks = 0;
        for (Project project : allClientProjects) {
            List<KanbanTask> tasks = kanbanTaskRepository.findByProjectId(project.getId());
            if (!tasks.isEmpty()) {
                double projectProgress = tasks.stream()
                        .mapToDouble(t -> {
                            String status = t.getStatus() != null ? t.getStatus().toUpperCase() : "";
                            if (status.contains("DONE")) return 100.0;
                            if (status.contains("REVIEW")) return 80.0;
                            if (status.contains("PROGRESS")) return 50.0;
                            return 0.0;
                        })
                        .average()
                        .orElse(0.0);
                
                double projectCompletion = tasks.stream()
                        .mapToDouble(t -> {
                            String status = t.getStatus() != null ? t.getStatus().toUpperCase() : "";
                            if (status.contains("DONE")) return 100.0;
                            return 0.0;
                        })
                        .average()
                        .orElse(0.0);

                totalProgress += (int) projectProgress;
                totalCompletion += (int) projectCompletion;
                projectCountWithTasks++;
            }
        }
        int avgProgress = projectCountWithTasks > 0 ? totalProgress / projectCountWithTasks : 0;
        int avgCompletion = projectCountWithTasks > 0 ? totalCompletion / projectCountWithTasks : 0;

        List<Proposal> recentProposals = allClientProposals.stream()
                .limit(5)
                .toList();

        List<Project> recentProjects = allClientProjects.stream()
                .limit(5)
                .toList();

        return ClientDashboardResponse.builder()
                .pendingProposalsCount(pendingProposalsCount)
                .acceptedProjectsCount(acceptedProjectsCount)
                .pendingChangeRequestsCount(pendingChangeRequestsCount)
                .approvedChangeRequestsCount(approvedChangeRequestsCount)
                .progress(avgProgress)
                .completion(avgCompletion)
                .recentProposals(recentProposals)
                .recentProjects(recentProjects)
                .build();
    }

    public CompanyDashboardResponse getCompanyDashboard(String companyId) {
        List<Proposal> proposals = proposalRepository.findByCompanyId(companyId);

        long totalProposals = proposals.size();

        long pendingApprovals = proposals.stream()
                .filter(p -> p.getStatus() != null && p.getStatus() == ProposalStatus.PENDING)
                .count();

        long acceptedProposals = proposals.stream()
                .filter(p -> p.getStatus() != null && p.getStatus() == ProposalStatus.ACCEPTED)
                .count();

        long rejectedProposals = proposals.stream()
                .filter(p -> p.getStatus() != null && p.getStatus() == ProposalStatus.REJECTED)
                .count();

        List<Project> projects = projectRepository.findByCompanyId(companyId);

        long totalProjects = projects.size();

        long activeProjects = projects.stream()
                .filter(p -> p.getStatus() != null && p.getStatus() == Project.ProjectStatus.ACTIVE)
                .count();

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

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        List<ProjectTableRow> recentProjects = projects.stream()
                .map(p -> ProjectTableRow.builder()
                        .id(p.getId())
                        .projectName(p.getName())
                        .status(p.getStatus() != null ? p.getStatus().name() : "UNKNOWN")
                        .owner(userNameMap.getOrDefault(p.getCompanyId(), "Unknown"))
                        .lastUpdated(
                                p.getUpdatedAt() != null
                                        ? p.getUpdatedAt().format(formatter)
                                        : p.getCreatedAt() != null
                                            ? p.getCreatedAt().format(formatter)
                                            : ""
                        )
                        .build())
                .collect(Collectors.toList());

        // Calculate Progress and Completion based on tasks
        int totalCompanyProgress = 0;
        int totalCompanyCompletion = 0;
        int companyProjectCountWithTasks = 0;
        for (Project project : projects) {
            List<KanbanTask> tasks = kanbanTaskRepository.findByProjectId(project.getId());
            if (!tasks.isEmpty()) {
                double projectProgress = tasks.stream()
                        .mapToDouble(t -> {
                            String status = t.getStatus() != null ? t.getStatus().toUpperCase() : "";
                            if (status.contains("DONE")) return 100.0;
                            if (status.contains("REVIEW")) return 80.0;
                            if (status.contains("PROGRESS")) return 50.0;
                            return 0.0;
                        })
                        .average()
                        .orElse(0.0);

                double projectCompletion = tasks.stream()
                        .mapToDouble(t -> {
                            String status = t.getStatus() != null ? t.getStatus().toUpperCase() : "";
                            if (status.contains("DONE")) return 100.0;
                            return 0.0;
                        })
                        .average()
                        .orElse(0.0);

                totalCompanyProgress += (int) projectProgress;
                totalCompanyCompletion += (int) projectCompletion;
                companyProjectCountWithTasks++;
            }
        }
        int avgCompanyProgress = companyProjectCountWithTasks > 0 ? totalCompanyProgress / companyProjectCountWithTasks : 0;
        int avgCompanyCompletion = companyProjectCountWithTasks > 0 ? totalCompanyCompletion / companyProjectCountWithTasks : 0;

        return CompanyDashboardResponse.builder()
                .totalProjects(totalProjects)
                .pendingApprovals(pendingApprovals)
                .totalProposals(totalProposals)
                .acceptedProposals(acceptedProposals)
                .rejectedProposals(rejectedProposals)
                .activeProjects(activeProjects)
                .progress(avgCompanyProgress)
                .completion(avgCompanyCompletion)
                .recentProjects(recentProjects)
                .build();
    }
}