package com.visionforge.crms.changerequest.service;

import com.visionforge.crms.changerequest.dto.ChangeRequestDecisionRequest;
import com.visionforge.crms.changerequest.dto.ChangeRequestResponse;
import com.visionforge.crms.changerequest.dto.CreateChangeRequestRequest;
import com.visionforge.crms.changerequest.model.ChangeRequest;
import com.visionforge.crms.changerequest.model.ChangeRequestStatus;
import com.visionforge.crms.changerequest.repository.ChangeRequestRepository;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.user.CurrentUserService;
import com.visionforge.crms.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;
    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUserService;

    // client creates change request
    public ChangeRequestResponse createChangeRequest(String projectId, CreateChangeRequestRequest request) {
        if (currentUserService.getCurrentUserRole() != Role.CLIENT) {
            throw new RuntimeException("Only client can create change requests");
        }

        String clientId = currentUserService.getCurrentUserId();

        Project project = projectRepository.findByIdAndClientId(projectId, clientId)
                .orElseThrow(() -> new RuntimeException("Project not found for this client"));

        ChangeRequest changeRequest = ChangeRequest.builder()
                .projectId(project.getId())
                .clientId(clientId)
                .companyId(project.getCompanyId())
                .title(request.getTitle())
                .description(request.getDescription())
                .budget(request.getBudget())
                .timeline(request.getTimeline())
                .priority(request.getPriority())
                .status(ChangeRequestStatus.PENDING)
                .rejectionReason(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return mapToResponse(changeRequestRepository.save(changeRequest));
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
        changeRequest.setRejectionReason(null);
        changeRequest.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(changeRequestRepository.save(changeRequest));
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

        changeRequest.setStatus(ChangeRequestStatus.REJECTED);
        changeRequest.setRejectionReason(
                request.getRejectionReason() == null || request.getRejectionReason().isBlank()
                        ? "No reason provided"
                        : request.getRejectionReason()
        );
        changeRequest.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(changeRequestRepository.save(changeRequest));
    }

    private ChangeRequestResponse mapToResponse(ChangeRequest changeRequest) {
        return ChangeRequestResponse.builder()
                .id(changeRequest.getId())
                .projectId(changeRequest.getProjectId())
                .clientId(changeRequest.getClientId())
                .companyId(changeRequest.getCompanyId())
                .title(changeRequest.getTitle())
                .description(changeRequest.getDescription())
                .budget(changeRequest.getBudget())
                .timeline(changeRequest.getTimeline())
                .priority(changeRequest.getPriority())
                .status(changeRequest.getStatus())
                .rejectionReason(changeRequest.getRejectionReason())
                .createdAt(changeRequest.getCreatedAt())
                .updatedAt(changeRequest.getUpdatedAt())
                .build();
    }
}