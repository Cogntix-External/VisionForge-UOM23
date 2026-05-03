package com.visionforge.crms.changerequest.service;

import com.visionforge.crms.changerequest.dto.ChangeRequestDecisionRequest;
import com.visionforge.crms.changerequest.dto.ChangeRequestImplementationRequest;
import com.visionforge.crms.changerequest.dto.ChangeRequestResponse;
import com.visionforge.crms.changerequest.dto.CreateChangeRequestRequest;
import com.visionforge.crms.changerequest.dto.VersionHistoryEntryResponse;
import com.visionforge.crms.changerequest.dto.VersionHistoryTableRowResponse;
import com.visionforge.crms.changerequest.model.ChangeRequest;
import com.visionforge.crms.changerequest.model.ChangeRequestStatus;
import com.visionforge.crms.changerequest.repository.ChangeRequestRepository;
import com.visionforge.crms.email.EmailService;
import com.visionforge.crms.notification.model.NotificationType;
import com.visionforge.crms.notification.service.NotificationService;
import com.visionforge.crms.prd.model.Prd;
import com.visionforge.crms.prd.repository.PrdRepository;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.user.CurrentUserService;
import com.visionforge.crms.user.Role;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChangeRequestServiceTest {

    @Mock
    private ChangeRequestRepository changeRequestRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private PrdRepository prdRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChangeRequestService changeRequestService;

    @Test
    void clientShouldCreateChangeRequest() {
        CreateChangeRequestRequest request = new CreateChangeRequestRequest();
        request.setTitle("Update UI");
        request.setDescription("Improve UI");
        request.setBudget(2000.0);
        request.setTimeline("2 weeks");
        request.setPriority("Medium");

        Project project = Project.builder()
                .id("project-1")
                .clientId("client-1")
                .companyId("company-1")
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CLIENT);
        when(currentUserService.getCurrentUserId()).thenReturn("client-1");
        when(projectRepository.findByIdAndClientId("project-1", "client-1"))
                .thenReturn(Optional.of(project));
        when(prdRepository.findByProjectId("project-1"))
                .thenReturn(Optional.empty());
        when(changeRequestRepository.save(any(ChangeRequest.class)))
                .thenAnswer(invocation -> {
                    ChangeRequest cr = invocation.getArgument(0);
                    cr.setId("cr-1");
                    return cr;
                });

        ChangeRequestResponse result =
                changeRequestService.createChangeRequest("project-1", request);

        assertThat(result.getId()).isEqualTo("cr-1");
        assertThat(result.getStatus()).isEqualTo(ChangeRequestStatus.PENDING);
        assertThat(result.getClientId()).isEqualTo("client-1");
        assertThat(result.getCompanyId()).isEqualTo("company-1");
    }

    @Test
    void getCurrentCompanyChangeRequestsMapsResults() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);
        when(currentUserService.getCurrentUserId()).thenReturn("company-1");
        when(changeRequestRepository.findByCompanyId("company-1"))
                .thenReturn(List.of(sampleChangeRequest(ChangeRequestStatus.PENDING)));

        List<ChangeRequestResponse> result =
                changeRequestService.getCurrentCompanyChangeRequests();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("cr-1");
        assertThat(result.get(0).getCompanyId()).isEqualTo("company-1");
    }

    @Test
    void acceptChangeRequestSetsAcceptedAndNotifiesClient() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);
        when(currentUserService.getCurrentUserId()).thenReturn("company-1");
        when(changeRequestRepository.findByIdAndCompanyId("cr-1", "company-1"))
                .thenReturn(Optional.of(sampleChangeRequest(ChangeRequestStatus.PENDING)));
        when(changeRequestRepository.save(any(ChangeRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById("client-1")).thenReturn(Optional.of(
                User.builder()
                        .id("client-1")
                        .email("client@example.com")
                        .build()
        ));

        ChangeRequestResponse response =
                changeRequestService.acceptChangeRequest("cr-1");

        assertThat(response.getStatus()).isEqualTo(ChangeRequestStatus.ACCEPTED);
        assertThat(response.getDecisionReason()).isEqualTo("Accepted by company");

        verify(notificationService).createNotification(
                "client-1",
                "Change Request Accepted",
                "Your change request has been accepted.",
                NotificationType.CHANGE_REQUEST_ACCEPTED,
                "cr-1",
                "CHANGE_REQUEST"
        );

        verify(emailService).sendEmail(
                "client@example.com",
                "Change Request Accepted",
                "Your change request has been accepted. Please log in to view the updated status."
        );
    }

    @Test
    void rejectChangeRequestUsesProvidedReason() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);
        when(currentUserService.getCurrentUserId()).thenReturn("company-1");
        when(changeRequestRepository.findByIdAndCompanyId("cr-1", "company-1"))
                .thenReturn(Optional.of(sampleChangeRequest(ChangeRequestStatus.PENDING)));
        when(changeRequestRepository.save(any(ChangeRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById("client-1")).thenReturn(Optional.of(
                User.builder()
                        .id("client-1")
                        .email("client@example.com")
                        .build()
        ));

        ChangeRequestDecisionRequest request = new ChangeRequestDecisionRequest();
        request.setRejectionReason("Not enough detail");

        ChangeRequestResponse response =
                changeRequestService.rejectChangeRequest("cr-1", request);

        assertThat(response.getStatus()).isEqualTo(ChangeRequestStatus.REJECTED);
        assertThat(response.getRejectionReason()).isEqualTo("Not enough detail");
    }

    @Test
    void markImplementedUpdatesVersionAndNotes() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);
        when(currentUserService.getCurrentUserId()).thenReturn("company-1");
        when(changeRequestRepository.findByIdAndCompanyId("cr-1", "company-1"))
                .thenReturn(Optional.of(sampleChangeRequest(ChangeRequestStatus.ACCEPTED)));
        when(changeRequestRepository.save(any(ChangeRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ChangeRequestImplementationRequest request = new ChangeRequestImplementationRequest();
        request.setImplementedVersion("1.1");
        request.setImplementationNotes("Done");

        ChangeRequestResponse response =
                changeRequestService.markImplemented("cr-1", request);

        assertThat(response.getStatus()).isEqualTo(ChangeRequestStatus.IMPLEMENTED);
        assertThat(response.getImplementedVersion()).isEqualTo("1.1");
        assertThat(response.getImplementationNotes()).isEqualTo("Done");
        assertThat(response.getImplementedAt()).isNotNull();
    }

    @Test
    void generateChangeRequestDocumentIncludesFields() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);
        when(currentUserService.getCurrentUserId()).thenReturn("company-1");
        when(changeRequestRepository.findByIdAndCompanyId("cr-1", "company-1"))
                .thenReturn(Optional.of(sampleChangeRequest(ChangeRequestStatus.ACCEPTED)));

        String text =
                new String(changeRequestService.generateChangeRequestDocument("cr-1"));

        assertThat(text).contains("CHANGE REQUEST DOCUMENT");
        assertThat(text).contains("Change Request ID: cr-1");
        assertThat(text).contains("Title: Add export");
    }

    @Test
    void getVersionHistoryEntriesReturnsPrdSnapshotWhenNoChangeRequestsExist() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);
        when(currentUserService.getCurrentUserId()).thenReturn("company-1");
        when(changeRequestRepository.findByCompanyIdAndProjectIdAndPrdId(
                "company-1",
                "project-1",
                "prd-1"
        )).thenReturn(List.of());

        when(prdRepository.findByProjectId("project-1")).thenReturn(Optional.of(
                Prd.builder()
                        .id("prd-1")
                        .projectId("project-1")
                        .title("Current PRD")
                        .version("1.0")
                        .mainFeatures("Feature set")
                        .build()
        ));

        List<VersionHistoryEntryResponse> result =
                changeRequestService.getVersionHistoryEntries("project-1", "prd-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getChangeRequestId()).isEqualTo("PRD-SNAPSHOT");
        assertThat(result.get(0).getStatus()).isEqualTo(ChangeRequestStatus.IMPLEMENTED);
    }

    @Test
    void getVersionHistoryTableRowsDeduplicatesAcceptedRows() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);
        when(currentUserService.getCurrentUserId()).thenReturn("company-1");
        when(changeRequestRepository.findByCompanyId("company-1")).thenReturn(List.of(
                sampleChangeRequest(ChangeRequestStatus.ACCEPTED),
                sampleChangeRequest(ChangeRequestStatus.ACCEPTED),
                sampleChangeRequest(ChangeRequestStatus.PENDING)
        ));

        List<VersionHistoryTableRowResponse> result =
                changeRequestService.getVersionHistoryTableRows();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProjectId()).isEqualTo("project-1");
    }

    private ChangeRequest sampleChangeRequest(ChangeRequestStatus status) {
        return ChangeRequest.builder()
                .id("cr-1")
                .projectId("project-1")
                .prdId("prd-1")
                .clientId("client-1")
                .companyId("company-1")
                .title("Add export")
                .description("Need export support")
                .budget(1000.0)
                .timeline("2 weeks")
                .priority("High")
                .status(status)
                .decisionReason("Accepted by company")
                .decidedAt(LocalDateTime.now())
                .rejectionReason(null)
                .implementedVersion("1.1")
                .implementationNotes("Done")
                .implementedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now())
                .build();
    }
}