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
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.prd.model.Prd;
import com.visionforge.crms.prd.repository.PrdRepository;
import com.visionforge.crms.user.CurrentUserService;
import com.visionforge.crms.user.Role;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;
    private final ProjectRepository projectRepository;
    private final PrdRepository prdRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    // client creates change request
    public ChangeRequestResponse createChangeRequest(String projectId, CreateChangeRequestRequest request) {
        if (currentUserService.getCurrentUserRole() != Role.CLIENT) {
            throw new RuntimeException("Only client can create change requests");
        }

        String clientId = currentUserService.getCurrentUserId();

        Project project = projectRepository.findByIdAndClientId(projectId, clientId)
                .orElseThrow(() -> new RuntimeException("Project not found for this client"));

        String resolvedPrdId = request.getPrdId();
        if (resolvedPrdId == null || resolvedPrdId.isBlank() || "-".equals(resolvedPrdId)) {
            resolvedPrdId = prdRepository.findByProjectId(project.getId())
                    .map(Prd::getId)
                    .orElse(null);
        }

        ChangeRequest changeRequest = ChangeRequest.builder()
                .projectId(project.getId())
                .prdId(resolvedPrdId)
                .clientId(clientId)
                .companyId(project.getCompanyId())
                .title(request.getTitle())
                .description(request.getDescription())
                .budget(request.getBudget())
                .timeline(request.getTimeline())
                .priority(request.getPriority())
                .status(ChangeRequestStatus.PENDING)
                .decisionReason(null)
                .decidedAt(null)
                .rejectionReason(null)
                .implementedVersion(null)
                .implementationNotes(null)
                .implementedAt(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ChangeRequest saved = changeRequestRepository.save(changeRequest);

        // optional: notify company that a new CR was raised
        notifyCompanyNewChangeRequest(saved);

        return mapToResponse(saved);
    }

    // client views own change requests
    public List<ChangeRequestResponse> getCurrentClientChangeRequests() {
        if (currentUserService.getCurrentUserRole() != Role.CLIENT) {
            throw new RuntimeException("Only client can view client change requests");
        }

        String clientId = currentUserService.getCurrentUserId();

        return changeRequestRepository.findByClientId(clientId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // client views own change requests by project
    public List<ChangeRequestResponse> getCurrentClientChangeRequestsByProject(String projectId) {
        if (currentUserService.getCurrentUserRole() != Role.CLIENT) {
            throw new RuntimeException("Only client can view client change requests");
        }

        String clientId = currentUserService.getCurrentUserId();

        return changeRequestRepository.findByClientIdAndProjectId(clientId, projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // company views received change requests
    public List<ChangeRequestResponse> getCurrentCompanyChangeRequests() {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new RuntimeException("Only company can view company change requests");
        }

        String companyId = currentUserService.getCurrentUserId();

        return changeRequestRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // company views received change requests by project
    public List<ChangeRequestResponse> getCurrentCompanyChangeRequestsByProject(String projectId) {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new RuntimeException("Only company can view company change requests");
        }

        String companyId = currentUserService.getCurrentUserId();

        return changeRequestRepository.findByCompanyIdAndProjectId(companyId, projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // company views received change requests by project and prd
    public List<ChangeRequestResponse> getCurrentCompanyChangeRequestsByProjectAndPrd(String projectId, String prdId) {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new RuntimeException("Only company can view company change requests");
        }

        String companyId = currentUserService.getCurrentUserId();

        return changeRequestRepository.findByCompanyIdAndProjectIdAndPrdId(companyId, projectId, prdId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // company accepts change request
    public ChangeRequestResponse acceptChangeRequest(String changeRequestId) {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new RuntimeException("Only company can accept change requests");
        }

        String companyId = currentUserService.getCurrentUserId();

        ChangeRequest changeRequest = changeRequestRepository.findByIdAndCompanyId(changeRequestId, companyId)
                .orElseThrow(() -> new RuntimeException("Change request not found for this company"));

        if (changeRequest.getStatus() != ChangeRequestStatus.PENDING) {
            throw new RuntimeException("Only pending change requests can be accepted");
        }

        changeRequest.setStatus(ChangeRequestStatus.ACCEPTED);
        changeRequest.setDecisionReason("Accepted by company");
        changeRequest.setDecidedAt(LocalDateTime.now());
        changeRequest.setRejectionReason(null);
        changeRequest.setUpdatedAt(LocalDateTime.now());

        ChangeRequest saved = changeRequestRepository.save(changeRequest);

        notifyClientChangeRequestAccepted(saved);

        return mapToResponse(saved);
    }

    // company rejects change request
    public ChangeRequestResponse rejectChangeRequest(String changeRequestId, ChangeRequestDecisionRequest request) {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new RuntimeException("Only company can reject change requests");
        }

        String companyId = currentUserService.getCurrentUserId();

        ChangeRequest changeRequest = changeRequestRepository.findByIdAndCompanyId(changeRequestId, companyId)
                .orElseThrow(() -> new RuntimeException("Change request not found for this company"));

        if (changeRequest.getStatus() != ChangeRequestStatus.PENDING) {
            throw new RuntimeException("Only pending change requests can be rejected");
        }

        String reason = request.getRejectionReason() == null || request.getRejectionReason().isBlank()
                ? "No reason provided"
                : request.getRejectionReason();

        changeRequest.setStatus(ChangeRequestStatus.REJECTED);
        changeRequest.setDecisionReason(reason);
        changeRequest.setDecidedAt(LocalDateTime.now());
        changeRequest.setRejectionReason(reason);
        changeRequest.setUpdatedAt(LocalDateTime.now());

        ChangeRequest saved = changeRequestRepository.save(changeRequest);

        notifyClientChangeRequestRejected(saved);

        return mapToResponse(saved);
    }

    // company accepts/rejects with reason in a single decision endpoint
    public ChangeRequestResponse decideChangeRequest(String changeRequestId, ChangeRequestDecisionRequest request) {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new RuntimeException("Only company can decide change requests");
        }

        if (request.getAccepted() == null) {
            throw new RuntimeException("Decision accepted flag is required");
        }

        String companyId = currentUserService.getCurrentUserId();

        ChangeRequest changeRequest = changeRequestRepository.findByIdAndCompanyId(changeRequestId, companyId)
                .orElseThrow(() -> new RuntimeException("Change request not found for this company"));

        if (changeRequest.getStatus() != ChangeRequestStatus.PENDING) {
            throw new RuntimeException("Only pending change requests can be decided");
        }

        String reason = request.getDecisionReason();
        if (reason == null || reason.isBlank()) {
            reason = request.getRejectionReason();
        }
        if (reason == null || reason.isBlank()) {
            reason = "No reason provided";
        }

        if (Boolean.TRUE.equals(request.getAccepted())) {
            changeRequest.setStatus(ChangeRequestStatus.ACCEPTED);
            changeRequest.setRejectionReason(null);
        } else {
            changeRequest.setStatus(ChangeRequestStatus.REJECTED);
            changeRequest.setRejectionReason(reason);
        }

        changeRequest.setDecisionReason(reason);
        changeRequest.setDecidedAt(LocalDateTime.now());
        changeRequest.setUpdatedAt(LocalDateTime.now());

        ChangeRequest saved = changeRequestRepository.save(changeRequest);

        if (saved.getStatus() == ChangeRequestStatus.ACCEPTED) {
            notifyClientChangeRequestAccepted(saved);
        } else if (saved.getStatus() == ChangeRequestStatus.REJECTED) {
            notifyClientChangeRequestRejected(saved);
        }

        return mapToResponse(saved);
    }

    // company marks accepted CR as implemented after PRD edit is done manually
    public ChangeRequestResponse markImplemented(String changeRequestId, ChangeRequestImplementationRequest request) {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new RuntimeException("Only company can mark implementation");
        }

        String companyId = currentUserService.getCurrentUserId();

        ChangeRequest changeRequest = changeRequestRepository.findByIdAndCompanyId(changeRequestId, companyId)
                .orElseThrow(() -> new RuntimeException("Change request not found for this company"));

        if (changeRequest.getStatus() != ChangeRequestStatus.ACCEPTED &&
                changeRequest.getStatus() != ChangeRequestStatus.IMPLEMENTED) {
            throw new RuntimeException("Only accepted change requests can be marked implemented");
        }

        changeRequest.setStatus(ChangeRequestStatus.IMPLEMENTED);
        changeRequest.setImplementedVersion(request.getImplementedVersion());
        changeRequest.setImplementationNotes(request.getImplementationNotes());
        changeRequest.setImplementedAt(LocalDateTime.now());
        changeRequest.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(changeRequestRepository.save(changeRequest));
    }

    // company downloads one change request document
    public byte[] generateChangeRequestDocument(String changeRequestId) {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new RuntimeException("Only company can download change request document");
        }

        String companyId = currentUserService.getCurrentUserId();

        ChangeRequest changeRequest = changeRequestRepository.findByIdAndCompanyId(changeRequestId, companyId)
                .orElseThrow(() -> new RuntimeException("Change request not found for this company"));

        StringBuilder content = new StringBuilder();
        content.append("CHANGE REQUEST DOCUMENT\n");
        content.append("=======================\n\n");
        content.append("Change Request ID: ").append(nvl(changeRequest.getId())).append("\n");
        content.append("Project ID: ").append(nvl(changeRequest.getProjectId())).append("\n");
        content.append("PRD ID: ").append(nvl(changeRequest.getPrdId())).append("\n");
        content.append("Client ID: ").append(nvl(changeRequest.getClientId())).append("\n");
        content.append("Company ID: ").append(nvl(changeRequest.getCompanyId())).append("\n");
        content.append("Status: ").append(changeRequest.getStatus()).append("\n");
        content.append("Decision Reason: ").append(nvl(changeRequest.getDecisionReason())).append("\n");
        content.append("Rejection Reason: ").append(nvl(changeRequest.getRejectionReason())).append("\n");
        content.append("Implemented Version: ").append(nvl(changeRequest.getImplementedVersion())).append("\n");
        content.append("Implementation Notes: ").append(nvl(changeRequest.getImplementationNotes())).append("\n");
        content.append("Created At: ").append(changeRequest.getCreatedAt()).append("\n");
        content.append("Decided At: ").append(changeRequest.getDecidedAt()).append("\n");
        content.append("Implemented At: ").append(changeRequest.getImplementedAt()).append("\n");
        content.append("Updated At: ").append(changeRequest.getUpdatedAt()).append("\n\n");
        content.append("Title: ").append(nvl(changeRequest.getTitle())).append("\n\n");
        content.append("Description:\n").append(nvl(changeRequest.getDescription())).append("\n\n");
        content.append("Budget: ").append(changeRequest.getBudget() == null ? "-" : changeRequest.getBudget()).append("\n");
        content.append("Timeline: ").append(nvl(changeRequest.getTimeline())).append("\n");
        content.append("Priority: ").append(nvl(changeRequest.getPriority())).append("\n");

        return content.toString().getBytes(StandardCharsets.UTF_8);
    }

    // company version-history table rows (projectId, prdId, clientId)
    public List<VersionHistoryTableRowResponse> getVersionHistoryTableRows() {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new RuntimeException("Only company can view version history");
        }

        String companyId = currentUserService.getCurrentUserId();

        Map<String, ChangeRequest> uniqueRows = changeRequestRepository.findByCompanyId(companyId)
                .stream()
                .filter(cr -> cr.getProjectId() != null && cr.getClientId() != null)
                .filter(cr -> cr.getStatus() == ChangeRequestStatus.ACCEPTED || cr.getStatus() == ChangeRequestStatus.IMPLEMENTED)
                .collect(Collectors.toMap(
                        cr -> cr.getProjectId() + "::" + nvl(cr.getPrdId()) + "::" + cr.getClientId(),
                        cr -> cr,
                        (existing, ignored) -> existing
                ));

        return uniqueRows.values().stream()
                .map(cr -> VersionHistoryTableRowResponse.builder()
                        .projectId(cr.getProjectId())
                        .prdId(cr.getPrdId())
                        .clientId(cr.getClientId())
                        .build())
                .toList();
    }

    // company version-history detail rows for one project/prd view button
    public List<VersionHistoryEntryResponse> getVersionHistoryEntries(String projectId, String prdId) {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new RuntimeException("Only company can view version history");
        }

        String companyId = currentUserService.getCurrentUserId();

        boolean useProjectLevel = prdId == null || prdId.isBlank() || "-".equals(prdId);

        List<ChangeRequest> filteredChangeRequests = (useProjectLevel
                ? changeRequestRepository.findByCompanyIdAndProjectId(companyId, projectId)
                : changeRequestRepository.findByCompanyIdAndProjectIdAndPrdId(companyId, projectId, prdId))
                .stream()
                .filter(cr -> cr.getStatus() == ChangeRequestStatus.ACCEPTED || cr.getStatus() == ChangeRequestStatus.IMPLEMENTED)
                .sorted(Comparator.comparing(ChangeRequest::getCreatedAt))
                .toList();

        List<VersionHistoryEntryResponse> historyEntries = new ArrayList<>(
                filteredChangeRequests.stream().map(this::mapToVersionHistoryEntry).toList()
        );

        if (historyEntries.isEmpty()) {
            prdRepository.findByProjectId(projectId).ifPresent(prd -> {
                historyEntries.add(VersionHistoryEntryResponse.builder()
                        .changeRequestId("PRD-SNAPSHOT")
                        .projectId(prd.getProjectId())
                        .prdId(prd.getId())
                        .clientId(prd.getAuthor())
                        .title(prd.getTitle())
                        .description("Current PRD snapshot. Earlier edit-by-edit history was not stored yet.")
                        .status(ChangeRequestStatus.IMPLEMENTED)
                        .decisionReason("Derived from PRD details/editor current saved version")
                        .rejectionReason(null)
                        .implementedVersion(prd.getVersion())
                        .implementationNotes(prd.getMainFeatures())
                        .createdAt(null)
                        .decidedAt(null)
                        .implementedAt(null)
                        .updatedAt(null)
                        .build());
            });
        }

        return historyEntries;
    }

    // auto mark latest accepted CR as implemented after PRD editor save/update
    public void markLatestAcceptedAsImplementedForPrdUpdate(String projectId, String prdId, String implementedVersion) {
        if (projectId == null || projectId.isBlank() || prdId == null || prdId.isBlank()) {
            return;
        }

        ChangeRequest latestAccepted = changeRequestRepository
                .findByProjectIdAndPrdIdAndStatus(projectId, prdId, ChangeRequestStatus.ACCEPTED)
                .stream()
                .max(Comparator.comparing(
                        cr -> cr.getDecidedAt() == null ? cr.getCreatedAt() : cr.getDecidedAt()
                ))
                .orElse(null);

        if (latestAccepted == null) {
            latestAccepted = changeRequestRepository
                    .findByProjectIdAndStatus(projectId, ChangeRequestStatus.ACCEPTED)
                    .stream()
                    .max(Comparator.comparing(
                            cr -> cr.getDecidedAt() == null ? cr.getCreatedAt() : cr.getDecidedAt()
                    ))
                    .orElse(null);
        }

        if (latestAccepted == null) {
            return;
        }

        latestAccepted.setStatus(ChangeRequestStatus.IMPLEMENTED);
        latestAccepted.setImplementedVersion(implementedVersion);
        latestAccepted.setImplementationNotes("Implemented via PRD editor save");
        latestAccepted.setImplementedAt(LocalDateTime.now());
        latestAccepted.setUpdatedAt(LocalDateTime.now());

        changeRequestRepository.save(latestAccepted);
    }

    private void notifyClientChangeRequestAccepted(ChangeRequest changeRequest) {
        try {
            notificationService.createNotification(
                    changeRequest.getClientId(),
                    "Change Request Accepted",
                    "Your change request has been accepted.",
                    NotificationType.CHANGE_REQUEST_ACCEPTED,
                    changeRequest.getId(),
                    "CHANGE_REQUEST"
            );
        } catch (Exception e) {
            System.err.println("Failed to send change request acceptance notification: " + e.getMessage());
        }

        try {
            User client = userRepository.findById(changeRequest.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));

            emailService.sendEmail(
                    client.getEmail(),
                    "Change Request Accepted",
                    "Your change request has been accepted. Please log in to view the updated status."
            );
        } catch (Exception e) {
            System.err.println("Failed to send acceptance email: " + e.getMessage());
        }
    }

    private void notifyCompanyNewChangeRequest(ChangeRequest changeRequest) {
        try {
            notificationService.createNotification(
                    changeRequest.getCompanyId(),
                    "New Change Request Submitted",
                    "A client has submitted a new change request.",
                    NotificationType.NEW_CHANGE_REQUEST,
                    changeRequest.getId(),
                    "CHANGE_REQUEST"
            );
        } catch (Exception e) {
            System.err.println("Failed to create company notification for new change request: " + e.getMessage());
        }

        try {
            User company = userRepository.findById(changeRequest.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company user not found"));

            emailService.sendEmail(
                    company.getEmail(),
                    "New Change Request Submitted",
                    "A client has submitted a new change request. Please log in to review it."
            );
        } catch (Exception e) {
            System.err.println("Failed to send new change request email to company: " + e.getMessage());
        }
    }

    private void notifyClientChangeRequestRejected(ChangeRequest changeRequest) {
        try {
            notificationService.createNotification(
                    changeRequest.getClientId(),
                    "Change Request Rejected",
                    "Your change request has been rejected.",
                    NotificationType.CHANGE_REQUEST_REJECTED,
                    changeRequest.getId(),
                    "CHANGE_REQUEST"
            );
        } catch (Exception e) {
            System.err.println("Failed to send change request rejection notification: " + e.getMessage());
        }

        try {
            User client = userRepository.findById(changeRequest.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));

            String reason = changeRequest.getRejectionReason() == null || changeRequest.getRejectionReason().isBlank()
                    ? "No reason provided"
                    : changeRequest.getRejectionReason();

            emailService.sendEmail(
                    client.getEmail(),
                    "Change Request Rejected",
                    "Your change request has been rejected.\nReason: " + reason
            );
        } catch (Exception e) {
            System.err.println("Failed to send rejection email: " + e.getMessage());
        }
    }

    private VersionHistoryEntryResponse mapToVersionHistoryEntry(ChangeRequest changeRequest) {
        return VersionHistoryEntryResponse.builder()
                .changeRequestId(changeRequest.getId())
                .projectId(changeRequest.getProjectId())
                .prdId(changeRequest.getPrdId())
                .clientId(changeRequest.getClientId())
                .title(changeRequest.getTitle())
                .description(changeRequest.getDescription())
                .status(changeRequest.getStatus())
                .decisionReason(changeRequest.getDecisionReason())
                .rejectionReason(changeRequest.getRejectionReason())
                .implementedVersion(changeRequest.getImplementedVersion())
                .implementationNotes(changeRequest.getImplementationNotes())
                .createdAt(changeRequest.getCreatedAt())
                .decidedAt(changeRequest.getDecidedAt())
                .implementedAt(changeRequest.getImplementedAt())
                .updatedAt(changeRequest.getUpdatedAt())
                .build();
    }

    private String nvl(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private ChangeRequestResponse mapToResponse(ChangeRequest changeRequest) {
        return ChangeRequestResponse.builder()
                .id(changeRequest.getId())
                .projectId(changeRequest.getProjectId())
                .prdId(changeRequest.getPrdId())
                .clientId(changeRequest.getClientId())
                .companyId(changeRequest.getCompanyId())
                .title(changeRequest.getTitle())
                .description(changeRequest.getDescription())
                .budget(changeRequest.getBudget())
                .timeline(changeRequest.getTimeline())
                .priority(changeRequest.getPriority())
                .status(changeRequest.getStatus())
                .decisionReason(changeRequest.getDecisionReason())
                .decidedAt(changeRequest.getDecidedAt())
                .rejectionReason(changeRequest.getRejectionReason())
                .implementedVersion(changeRequest.getImplementedVersion())
                .implementationNotes(changeRequest.getImplementationNotes())
                .implementedAt(changeRequest.getImplementedAt())
                .createdAt(changeRequest.getCreatedAt())
                .updatedAt(changeRequest.getUpdatedAt())
                .build();
    }
}
