package com.visionforge.crms.proposal.service;

import com.visionforge.crms.email.EmailService;
import com.visionforge.crms.notification.model.NotificationType;
import com.visionforge.crms.notification.service.NotificationService;
import com.visionforge.crms.project.service.ProjectService;
import com.visionforge.crms.proposal.dto.CreateProposalRequest;
import com.visionforge.crms.proposal.dto.ProposalDecisionRequest;
import com.visionforge.crms.proposal.dto.ProposalResponse;
import com.visionforge.crms.proposal.model.Proposal;
import com.visionforge.crms.proposal.model.ProposalStatus;
import com.visionforge.crms.proposal.repository.ProposalRepository;
import com.visionforge.crms.user.CurrentUserService;
import com.visionforge.crms.user.Role;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Proposal Service Tests")
class ProposalServiceTest {

    @Mock
    private ProposalRepository proposalRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private ProjectService projectService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProposalService proposalService;

    private Proposal proposal;
    private CreateProposalRequest createRequest;
    private User clientUser;
    private User companyUser;

    @BeforeEach
    void setUp() {
        proposal = Proposal.builder()
                .id("proposal001")
                .title("E-Commerce Website")
                .description("Build website")
                .clientId("client001")
                .clientName("Test Client")
                .companyId("company001")
                .status(ProposalStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        createRequest = new CreateProposalRequest();
        createRequest.setTitle("E-Commerce Website");
        createRequest.setDescription("Build website");
        createRequest.setClientId("client001");
        createRequest.setClientName("Test Client");

        clientUser = new User();
        clientUser.setId("client001");
        clientUser.setEmail("client@test.com");

        companyUser = new User();
        companyUser.setId("company001");
        companyUser.setEmail("company@test.com");
    }

    @Test
    @DisplayName("Create proposal - Success")
    void createProposal_Success() {
        when(proposalRepository.save(any(Proposal.class)))
                .thenReturn(proposal);
        when(userRepository.findById("client001"))
                .thenReturn(Optional.of(clientUser));

        ProposalResponse response = proposalService.createProposal(createRequest, "company001");

        assertNotNull(response);
        assertEquals("E-Commerce Website", response.getTitle());
        assertEquals("company001", response.getCompanyId());
        assertEquals("client001", response.getClientId());
        assertEquals(ProposalStatus.PENDING, response.getStatus());

        verify(proposalRepository, times(1)).save(any(Proposal.class));
        verify(notificationService, times(1)).createNotification(
                eq("client001"),
                eq("New Proposal Received"),
                anyString(),
                eq(NotificationType.NEW_PROPOSAL),
                eq("proposal001"),
                eq("PROPOSAL")
        );
        verify(emailService, times(1))
                .sendEmail(eq("client@test.com"), eq("New Proposal Received"), anyString());
    }

    @Test
    @DisplayName("Get proposals by company - Returns list")
    void getProposalsByCompany_ReturnsList() {
        when(proposalRepository.findByCompanyId("company001"))
                .thenReturn(List.of(proposal));

        List<ProposalResponse> responses = proposalService.getProposalsByCompany("company001");

        assertEquals(1, responses.size());
        assertEquals("E-Commerce Website", responses.get(0).getTitle());

        verify(proposalRepository, times(1)).findByCompanyId("company001");
    }

    @Test
    @DisplayName("Get proposals by company - Empty list")
    void getProposalsByCompany_EmptyList() {
        when(proposalRepository.findByCompanyId("company999"))
                .thenReturn(List.of());

        List<ProposalResponse> responses = proposalService.getProposalsByCompany("company999");

        assertTrue(responses.isEmpty());
        verify(proposalRepository, times(1)).findByCompanyId("company999");
    }

    @Test
    @DisplayName("Get current client proposal by ID - Success")
    void getCurrentClientProposalById_Success() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CLIENT);
        when(currentUserService.getCurrentUserId()).thenReturn("client001");
        when(proposalRepository.findByIdAndClientId("proposal001", "client001"))
                .thenReturn(Optional.of(proposal));

        ProposalResponse response = proposalService.getCurrentClientProposalById("proposal001");

        assertNotNull(response);
        assertEquals("proposal001", response.getId());
        assertEquals("E-Commerce Website", response.getTitle());

        verify(proposalRepository, times(1)).findByIdAndClientId("proposal001", "client001");
    }

    @Test
    @DisplayName("Get current client proposal by ID - Not found throws exception")
    void getCurrentClientProposalById_NotFound_ThrowsException() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CLIENT);
        when(currentUserService.getCurrentUserId()).thenReturn("client001");
        when(proposalRepository.findByIdAndClientId("invalid", "client001"))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> proposalService.getCurrentClientProposalById("invalid")
        );

        assertTrue(ex.getMessage().contains("Proposal not found"));
    }

    @Test
    @DisplayName("Accept current client proposal - Success with project and notification")
    void acceptCurrentClientProposal_Success() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CLIENT);
        when(currentUserService.getCurrentUserId()).thenReturn("client001");
        when(proposalRepository.findByIdAndClientId("proposal001", "client001"))
                .thenReturn(Optional.of(proposal));
        when(proposalRepository.save(any(Proposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById("company001"))
                .thenReturn(Optional.of(companyUser));

        ProposalResponse response = proposalService.acceptCurrentClientProposal("proposal001");

        assertEquals(ProposalStatus.ACCEPTED, response.getStatus());

        verify(projectService, times(1)).createProjectFromProposal(any(Proposal.class));
        verify(notificationService, times(1)).createNotification(
                eq("company001"),
                eq("Proposal Accepted"),
                anyString(),
                eq(NotificationType.PROPOSAL_ACCEPTED),
                eq("proposal001"),
                eq("PROPOSAL")
        );
        verify(emailService, times(1))
                .sendEmail(eq("company@test.com"), eq("Proposal Accepted"), anyString());
    }

    @Test
    @DisplayName("Accept current client proposal - Non-client throws exception")
    void acceptCurrentClientProposal_NonClient_ThrowsException() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> proposalService.acceptCurrentClientProposal("proposal001")
        );

        assertTrue(ex.getMessage().contains("Only client"));
        verify(proposalRepository, never()).save(any());
        verify(projectService, never()).createProjectFromProposal(any());
    }

    @Test
    @DisplayName("Reject current client proposal - Success with notification")
    void rejectCurrentClientProposal_Success() {
        ProposalDecisionRequest decisionRequest = new ProposalDecisionRequest();
        decisionRequest.setRejectionReason("Budget too high");

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CLIENT);
        when(currentUserService.getCurrentUserId()).thenReturn("client001");
        when(proposalRepository.findByIdAndClientId("proposal001", "client001"))
                .thenReturn(Optional.of(proposal));
        when(proposalRepository.save(any(Proposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById("company001"))
                .thenReturn(Optional.of(companyUser));

        ProposalResponse response =
                proposalService.rejectCurrentClientProposal("proposal001", decisionRequest);

        assertEquals(ProposalStatus.REJECTED, response.getStatus());
        assertEquals("Budget too high", response.getRejectionReason());

        verify(notificationService, times(1)).createNotification(
                eq("company001"),
                eq("Proposal Rejected"),
                contains("Budget too high"),
                eq(NotificationType.PROPOSAL_REJECTED),
                eq("proposal001"),
                eq("PROPOSAL")
        );
    }

    @Test
    @DisplayName("Reject current client proposal - Non-client throws exception")
    void rejectCurrentClientProposal_NonClient_ThrowsException() {
        ProposalDecisionRequest decisionRequest = new ProposalDecisionRequest();
        decisionRequest.setRejectionReason("Budget too high");

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> proposalService.rejectCurrentClientProposal("proposal001", decisionRequest)
        );

        assertTrue(ex.getMessage().contains("Only client"));
        verify(proposalRepository, never()).save(any());
    }

    @Test
    @DisplayName("Client accepts proposal and project is created")
    void clientShouldAcceptProposalAndCreateProject() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CLIENT);
        when(currentUserService.getCurrentUserId()).thenReturn("client001");
        when(proposalRepository.findByIdAndClientId("proposal001", "client001"))
                .thenReturn(Optional.of(proposal));
        when(proposalRepository.save(any(Proposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById("company001"))
                .thenReturn(Optional.of(companyUser));

        ProposalResponse result = proposalService.acceptCurrentClientProposal("proposal001");

        assertEquals(ProposalStatus.ACCEPTED, result.getStatus());
        verify(projectService).createProjectFromProposal(any(Proposal.class));
    }

    @Test
    @DisplayName("Client rejects proposal with reason")
    void clientShouldRejectProposal() {
        ProposalDecisionRequest decisionRequest = new ProposalDecisionRequest();
        decisionRequest.setRejectionReason("Budget too high");

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CLIENT);
        when(currentUserService.getCurrentUserId()).thenReturn("client001");
        when(proposalRepository.findByIdAndClientId("proposal001", "client001"))
                .thenReturn(Optional.of(proposal));
        when(proposalRepository.save(any(Proposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById("company001"))
                .thenReturn(Optional.of(companyUser));

        ProposalResponse result =
                proposalService.rejectCurrentClientProposal("proposal001", decisionRequest);

        assertEquals(ProposalStatus.REJECTED, result.getStatus());
        assertEquals("Budget too high", result.getRejectionReason());
    }
}