package com.visionforge.crms.prd.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.web.server.ResponseStatusException;

import com.visionforge.crms.changerequest.service.ChangeRequestService;
import com.visionforge.crms.email.EmailService;
import com.visionforge.crms.notification.model.NotificationType;
import com.visionforge.crms.notification.service.NotificationService;
import com.visionforge.crms.prd.dto.CreatePrdRequest;
import com.visionforge.crms.prd.dto.PrdResponse;
import com.visionforge.crms.prd.dto.UpdatePrdRequest;
import com.visionforge.crms.prd.model.Prd;
import com.visionforge.crms.prd.repository.PrdRepository;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;

@ExtendWith(MockitoExtension.class)
class PrdServiceTest {

    @Mock
    private PrdRepository prdRepository;

    @Mock
    private ChangeRequestService changeRequestService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PrdService prdService;

    @Test
    void getAllPrdsMapsResponses() {
        Prd prd = samplePrd();
        when(prdRepository.findAll()).thenReturn(List.of(prd));
        when(prdRepository.findAll(any(Sort.class))).thenReturn(List.of(prd));

        List<PrdResponse> result = prdService.getAllPrds();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("prd-1");
        assertThat(result.get(0).getStakeholders()).hasSize(1);
        assertThat(result.get(0).getMilestones()).hasSize(1);
    }

    @Test
    void getPrdByIdThrowsWhenMissing() {
        when(prdRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prdService.getPrdById("missing"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("PRD not found");
    }

    @Test
    void createPrdSavesAndNotifiesCompany() {
        CreatePrdRequest request = sampleCreateRequest();
        Prd existing = Prd.builder().pid("PRD-009").createdAt(Instant.now().minusSeconds(60)).build();
        when(prdRepository.existsByProjectId("project-1")).thenReturn(false);
        when(prdRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.of(existing));
        when(prdRepository.save(any(Prd.class))).thenAnswer(invocation -> {
            Prd prd = invocation.getArgument(0);
            prd.setId("prd-1");
            return prd;
        });
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(Project.builder()
                .id("project-1")
                .clientId("client-1")
                .build()));
        when(userRepository.findById("client-1")).thenReturn(Optional.of(User.builder()
                .id("client-1")
                .email("client@example.com")
                .build()));
        doNothing().when(changeRequestService).markLatestAcceptedAsImplementedForPrdUpdate(any(), any(), any());

        ArgumentCaptor<Prd> captor = ArgumentCaptor.forClass(Prd.class);
        PrdResponse response = prdService.createPrd(request);

        verify(prdRepository).save(captor.capture());
        Prd saved = captor.getValue();
        assertThat(saved.getPid()).isEqualTo("PRD-010");
        assertThat(saved.getStatus()).isEqualTo("In Review");
        assertThat(saved.getVersion()).isEqualTo("1.0");
        assertThat(saved.getStakeholders()).hasSize(1);
        assertThat(saved.getMilestones()).hasSize(1);
        assertThat(response.getId()).isEqualTo("prd-1");

        verify(changeRequestService).markLatestAcceptedAsImplementedForPrdUpdate("project-1", "prd-1", "1.0");
        verify(notificationService).createNotification(
                "client-1",
                "New PRD Uploaded",
                "A new PRD has been uploaded for your project.",
                NotificationType.PRD_UPLOADED,
                "prd-1",
                "PRD"
        );
        verify(emailService).sendEmail(
                "client@example.com",
                "New PRD Uploaded",
                "A new PRD is available for your project. Please log in to view it."
        );
    }

    @Test
    void createPrdRejectsIncompleteRequest() {
        CreatePrdRequest request = new CreatePrdRequest();
        request.setProjectId("project-1");

        assertThatThrownBy(() -> prdService.createPrd(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Project name is required");
    }

    @Test
    void createPrdRejectsDuplicateProjectPrd() {
        CreatePrdRequest request = sampleCreateRequest();
        when(prdRepository.existsByProjectId("project-1")).thenReturn(true);

        assertThatThrownBy(() -> prdService.createPrd(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("A PRD already exists for this project");

        verify(prdRepository, never()).save(any(Prd.class));
    }

    @Test
    void updatePrdApprovesAndNotifiesCompany() {
        Prd prd = samplePrd();
        when(prdRepository.findById("prd-1")).thenReturn(Optional.of(prd));
        when(prdRepository.save(any(Prd.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(Project.builder()
                .id("project-1")
                .clientId("client-1")
                .build()));
        when(userRepository.findById("client-1")).thenReturn(Optional.of(User.builder()
                .id("client-1")
                .email("client@example.com")
                .build()));

        UpdatePrdRequest request = new UpdatePrdRequest();
        request.setProjectName("Updated PRD");
        request.setAction("APPROVE");

        PrdResponse response = prdService.updatePrd("prd-1", request);

        assertThat(response.getTitle()).isEqualTo("Updated PRD");
        assertThat(response.getStatus()).isEqualTo("Approved");
        assertThat(response.getVersion()).isEqualTo("1.1");
        assertThat(response.isReviewedByChecker()).isTrue();
        assertThat(response.isSentToClient()).isTrue();

        verify(notificationService).createNotification(
                "client-1",
                "New PRD Uploaded",
                "A new PRD has been uploaded for your project.",
                NotificationType.PRD_UPLOADED,
                "prd-1",
                "PRD"
        );
    }

    @Test
    void updatePrdSaveChangesIncrementsVersionWhenVersionUnchanged() {
        Prd prd = samplePrd();
        when(prdRepository.findById("prd-1")).thenReturn(Optional.of(prd));
        when(prdRepository.save(any(Prd.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdatePrdRequest request = new UpdatePrdRequest();
        request.setProjectName("Updated PRD");
        request.setVersion("1.0");
        request.setAction("SAVE_CHANGES");

        PrdResponse response = prdService.updatePrd("prd-1", request);

        assertThat(response.getVersion()).isEqualTo("1.1");
        assertThat(response.getStatus()).isEqualTo("In Review");
    }

    @Test
    void updatePrdSavesManualVersion() {
        Prd prd = samplePrd();
        when(prdRepository.findById("prd-1")).thenReturn(Optional.of(prd));
        when(prdRepository.save(any(Prd.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdatePrdRequest request = new UpdatePrdRequest();
        request.setVersion("1.3");
        request.setAction("SAVE_CHANGES");

        PrdResponse response = prdService.updatePrd("prd-1", request);

        assertThat(response.getVersion()).isEqualTo("1.3");
        assertThat(response.getStatus()).isEqualTo("In Review");
    }

    @Test
    void generatePrdDocumentIncludesProjectDetails() {
        when(prdRepository.findById("prd-1")).thenReturn(Optional.of(samplePrd()));

        byte[] content = prdService.generatePrdDocument("prd-1");
        String text = new String(content);

        assertThat(text).contains("PRODUCT REQUIREMENTS DOCUMENT (PRD)");
        assertThat(text).contains("Project Name: Sample Project");
        assertThat(text).contains("Title: Sample Project");
        assertThat(text).contains("Main Features:");
    }

    private Prd samplePrd() {
        return Prd.builder()
                .id("prd-1")
                .projectId("project-1")
                .pid("PRD-001")
                .title("Sample Project")
                .status("In Review")
                .version("1.0")
                .createdDate("2026-04-29")
                .reviewedByChecker(false)
                .sentToClient(false)
                .projectName("Sample Project")
                .author("client-1")
                .dateSubmitted("2026-04-29")
                .purpose("Purpose")
                .problemToSolve("Problem")
                .projectGoal("Goal")
                .stakeholders(List.of(new Prd.Stakeholder("Owner", "Jane", "Approve work")))
                .inScope("In scope")
                .outOfScope("Out of scope")
                .mainFeatures("Main features")
                .functionalRequirement("Functional requirement")
                .nonFunctionalRequirement("Non-functional requirement")
                .userRoles("Users")
                .risksDependencies("Risks")
                .milestones(List.of(new Prd.Milestone("Phase 1", "Task 1", "2 weeks", "Team")))
                .createdAt(Instant.now())
                .build();
    }

    private CreatePrdRequest sampleCreateRequest() {
        CreatePrdRequest request = new CreatePrdRequest();
        request.setProjectId("project-1");
        request.setProjectName("Sample Project");
        request.setAuthor("client-1");
        request.setDateSubmitted("2026-04-29");
        request.setPurpose("Purpose");
        request.setProblemToSolve("Problem");
        request.setProjectGoal("Goal");
        request.setInScope("In scope");
        request.setOutOfScope("Out of scope");
        request.setMainFeatures("Main features");
        request.setFunctionalRequirement("Functional requirement");
        request.setNonFunctionalRequirement("Non-functional requirement");
        request.setUserRoles("Users");
        request.setRisksDependencies("Risks");

        CreatePrdRequest.StakeholderDto stakeholder = new CreatePrdRequest.StakeholderDto();
        stakeholder.setRole("Owner");
        stakeholder.setName("Jane");
        stakeholder.setResponsibility("Approve work");
        request.setStakeholders(List.of(stakeholder));

        CreatePrdRequest.MilestoneDto milestone = new CreatePrdRequest.MilestoneDto();
        milestone.setPhase("Phase 1");
        milestone.setTask("Task 1");
        milestone.setDuration("2 weeks");
        milestone.setResponsibility("Team");
        request.setMilestones(List.of(milestone));

        return request;
    }
}
