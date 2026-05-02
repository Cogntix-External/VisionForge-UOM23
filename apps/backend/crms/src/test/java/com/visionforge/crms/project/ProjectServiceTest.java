package com.visionforge.crms.project;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.visionforge.crms.changerequest.repository.ChangeRequestRepository;
import com.visionforge.crms.project.dto.ProjectResponse;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.model.Project.ProjectStatus;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.project.service.ProjectService;
import com.visionforge.crms.proposal.model.Proposal;

@ExtendWith(MockitoExtension.class)
@DisplayName("Project Service Tests")
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ChangeRequestRepository changeRequestRepository;

    @InjectMocks
    private ProjectService projectService;

    private Project project;
    private Proposal proposal;

    @BeforeEach
    void setUp() {
        proposal = Proposal.builder()
                .id("proposal001")
                .title("E-Commerce Website")
                .description("Build website")
                .clientId("client001")
                .companyId("company001")
                .build();

        project = Project.builder()
                .id("project001")
                .name("E-Commerce Website")
                .description("Build website")
                .proposalId("proposal001")
                .clientId("client001")
                .companyId("company001")
                .status(ProjectStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        lenient().when(changeRequestRepository.findByProjectId(any()))
                .thenReturn(List.of());
    }

    // ── Create Project Tests ────────────────────────────────────────
    @Test
    @DisplayName("Create project from proposal - Success")
    void createProjectFromProposal_Success() {
        when(projectRepository.findByProposalId("proposal001"))
                .thenReturn(Optional.empty());
        when(projectRepository.save(any(Project.class)))
                .thenReturn(project);

        ProjectResponse response = projectService
                .createProjectFromProposal(proposal);

        assertNotNull(response);
        assertEquals("E-Commerce Website", response.getName());
        assertEquals("company001", response.getCompanyId());
        assertEquals("client001", response.getClientId());
        assertEquals(ProjectStatus.ACTIVE, response.getStatus());
        assertEquals("proposal001", response.getProposalId());

        verify(projectRepository, times(1))
                .save(any(Project.class));
    }

    @Test
    @DisplayName("Create project - Already exists returns existing project")
    void createProjectFromProposal_AlreadyExists_ReturnsExistingProject() {
        when(projectRepository.findByProposalId("proposal001"))
                .thenReturn(Optional.of(project));

        ProjectResponse response = projectService
                .createProjectFromProposal(proposal);

        assertNotNull(response);
        assertEquals("project001", response.getId());
        assertEquals("proposal001", response.getProposalId());
        verify(projectRepository, never()).save(any());
    }

    // ── Get Projects Tests ──────────────────────────────────────────
    @Test
    @DisplayName("Get projects by company - Returns list")
    void getProjectsByCompany_ReturnsList() {
        when(projectRepository.findByCompanyId("company001"))
                .thenReturn(List.of(project));

        List<ProjectResponse> responses = projectService
                .getProjectsByCompany("company001");

        assertEquals(1, responses.size());
        assertEquals("E-Commerce Website",
                responses.get(0).getName());
        assertEquals(ProjectStatus.ACTIVE,
                responses.get(0).getStatus());
    }

    @Test
    @DisplayName("Get projects by company - Empty list")
    void getProjectsByCompany_EmptyList() {
        when(projectRepository.findByCompanyId("company999"))
                .thenReturn(List.of());

        List<ProjectResponse> responses = projectService
                .getProjectsByCompany("company999");

        assertTrue(responses.isEmpty());
    }

    // ── Get By ID Tests ─────────────────────────────────────────────
    @Test
    @DisplayName("Get project by ID - Success")
    void getProjectById_Success() {
        when(projectRepository.findById("project001"))
                .thenReturn(Optional.of(project));

        ProjectResponse response = projectService
                .getProjectById("project001");

        assertNotNull(response);
        assertEquals("project001", response.getId());
        assertEquals("E-Commerce Website", response.getName());
    }

    @Test
    @DisplayName("Get project by ID - Not found throws exception")
    void getProjectById_NotFound_ThrowsException() {
        when(projectRepository.findById("invalid"))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> projectService.getProjectById("invalid")
        );
        assertTrue(ex.getMessage().contains("Project not found"));
    }
}
