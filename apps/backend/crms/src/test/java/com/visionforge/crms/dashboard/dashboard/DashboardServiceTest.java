package com.visionforge.crms.dashboard.dashboard;

import com.visionforge.crms.dashboard.dto.CompanyDashboardResponse;
import com.visionforge.crms.dashboard.service.DashboardService;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.model.Project.ProjectStatus;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.proposal.model.Proposal;
import com.visionforge.crms.proposal.model.ProposalStatus;
import com.visionforge.crms.proposal.repository.ProposalRepository;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Dashboard Service Tests")
class DashboardServiceTest {

    @Mock
    private ProposalRepository proposalRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private Proposal pendingProposal;
    private Proposal acceptedProposal;
    private Proposal rejectedProposal;
    private Project activeProject;
    private User companyUser;

    @BeforeEach
    void setUp() {
        pendingProposal = Proposal.builder()
                .id("p1").title("Project 1")
                .companyId("company001")
                .status(ProposalStatus.PENDING)
                .build();

        acceptedProposal = Proposal.builder()
                .id("p2").title("Project 2")
                .companyId("company001")
                .status(ProposalStatus.ACCEPTED)
                .build();

        rejectedProposal = Proposal.builder()
                .id("p3").title("Project 3")
                .companyId("company001")
                .status(ProposalStatus.REJECTED)
                .build();

        activeProject = Project.builder()
                .id("proj1")
                .name("E-Commerce Website")
                .companyId("company001")
                .status(ProjectStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        companyUser = new User();
        companyUser.setId("company001");
        companyUser.setName("Test Company");
        companyUser.setEmail("test@company.com");
    }

    // ── Dashboard Count Tests ───────────────────────────────────────
    @Test
    @DisplayName("Dashboard - Correct proposal counts")
    void getCompanyDashboard_CorrectCounts() {
        when(proposalRepository.findByCompanyId("company001"))
                .thenReturn(List.of(
                        pendingProposal,
                        acceptedProposal,
                        rejectedProposal));
        when(projectRepository.findByCompanyId("company001"))
                .thenReturn(List.of(activeProject));
        when(userRepository.findAllById(any()))
                .thenReturn(List.of(companyUser));

        CompanyDashboardResponse response = dashboardService
                .getCompanyDashboard("company001");

        assertNotNull(response);
        assertEquals(3, response.getTotalProposals());
        assertEquals(1, response.getPendingApprovals());
        assertEquals(1, response.getAcceptedProposals());
        assertEquals(1, response.getRejectedProposals());
        assertEquals(1, response.getTotalProjects());
        assertEquals(1, response.getActiveProjects());
    }

    @Test
    @DisplayName("Dashboard - No data returns zeros")
    void getCompanyDashboard_NoData_ReturnsZeros() {
        when(proposalRepository.findByCompanyId("company999"))
                .thenReturn(List.of());
        when(projectRepository.findByCompanyId("company999"))
                .thenReturn(List.of());
        when(userRepository.findAllById(any()))
                .thenReturn(List.of());

        CompanyDashboardResponse response = dashboardService
                .getCompanyDashboard("company999");

        assertEquals(0, response.getTotalProposals());
        assertEquals(0, response.getPendingApprovals());
        assertEquals(0, response.getTotalProjects());
        assertTrue(response.getRecentProjects().isEmpty());
    }

    @Test
    @DisplayName("Dashboard - Table rows correct")
    void getCompanyDashboard_TableRows_Correct() {
        when(proposalRepository.findByCompanyId("company001"))
                .thenReturn(List.of(acceptedProposal));
        when(projectRepository.findByCompanyId("company001"))
                .thenReturn(List.of(activeProject));
        when(userRepository.findAllById(any()))
                .thenReturn(List.of(companyUser));

        CompanyDashboardResponse response = dashboardService
                .getCompanyDashboard("company001");

        assertNotNull(response.getRecentProjects());
        assertEquals(1, response.getRecentProjects().size());
        assertEquals("E-Commerce Website",
                response.getRecentProjects().get(0).getProjectName());
        assertEquals("ACTIVE",
                response.getRecentProjects().get(0).getStatus());
        assertEquals("Test Company",
                response.getRecentProjects().get(0).getOwner());
    }
}
