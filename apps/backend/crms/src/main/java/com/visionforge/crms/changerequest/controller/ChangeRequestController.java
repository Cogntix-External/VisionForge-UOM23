package com.visionforge.crms.changerequest.controller;

import com.visionforge.crms.changerequest.dto.ChangeRequestDecisionRequest;
import com.visionforge.crms.changerequest.dto.ChangeRequestImplementationRequest;
import com.visionforge.crms.changerequest.dto.ChangeRequestResponse;
import com.visionforge.crms.changerequest.dto.CreateChangeRequestRequest;
import com.visionforge.crms.changerequest.dto.VersionHistoryEntryResponse;
import com.visionforge.crms.changerequest.dto.VersionHistoryTableRowResponse;
import com.visionforge.crms.changerequest.service.ChangeRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChangeRequestController {

    private final ChangeRequestService changeRequestService;

    // client submit CR to company
    @PostMapping("/client/projects/{projectId}/change-requests")
    public ResponseEntity<ChangeRequestResponse> createChangeRequest(
            @PathVariable String projectId,
            @Valid @RequestBody CreateChangeRequestRequest request
    ) {
        ChangeRequestResponse response = changeRequestService.createChangeRequest(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // client own CR list
    @GetMapping("/client/change-requests")
    public ResponseEntity<List<ChangeRequestResponse>> getClientChangeRequests() {
        return ResponseEntity.ok(changeRequestService.getCurrentClientChangeRequests());
    }

    // client own CR list by project
    @GetMapping("/client/projects/{projectId}/change-requests")
    public ResponseEntity<List<ChangeRequestResponse>> getClientChangeRequestsByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(changeRequestService.getCurrentClientChangeRequestsByProject(projectId));
    }

    // company received CR list
    @GetMapping("/company/change-requests")
    public ResponseEntity<List<ChangeRequestResponse>> getCompanyChangeRequests() {
        return ResponseEntity.ok(changeRequestService.getCurrentCompanyChangeRequests());
    }

    // company received CR list by project
    @GetMapping("/company/projects/{projectId}/change-requests")
    public ResponseEntity<List<ChangeRequestResponse>> getCompanyChangeRequestsByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(changeRequestService.getCurrentCompanyChangeRequestsByProject(projectId));
    }

    // company received CR list by project and PRD
    @GetMapping("/company/projects/{projectId}/prds/{prdId}/change-requests")
    public ResponseEntity<List<ChangeRequestResponse>> getCompanyChangeRequestsByProjectAndPrd(
            @PathVariable String projectId,
            @PathVariable String prdId
    ) {
        return ResponseEntity.ok(changeRequestService.getCurrentCompanyChangeRequestsByProjectAndPrd(projectId, prdId));
    }

    // company accept CR
    @PatchMapping("/company/change-requests/{id}/accept")
    public ResponseEntity<ChangeRequestResponse> acceptChangeRequest(@PathVariable String id) {
        return ResponseEntity.ok(changeRequestService.acceptChangeRequest(id));
    }

    // company reject CR
    @PatchMapping("/company/change-requests/{id}/reject")
    public ResponseEntity<ChangeRequestResponse> rejectChangeRequest(
            @PathVariable String id,
            @RequestBody ChangeRequestDecisionRequest request
    ) {
        return ResponseEntity.ok(changeRequestService.rejectChangeRequest(id, request));
    }

    // company decide CR (accept/reject) with reason
    @PatchMapping("/company/change-requests/{id}/decision")
    public ResponseEntity<ChangeRequestResponse> decideChangeRequest(
            @PathVariable String id,
            @RequestBody ChangeRequestDecisionRequest request
    ) {
        return ResponseEntity.ok(changeRequestService.decideChangeRequest(id, request));
    }

    // company marks accepted CR as implemented with version information
    @PatchMapping("/company/change-requests/{id}/implemented")
    public ResponseEntity<ChangeRequestResponse> markImplemented(
            @PathVariable String id,
            @RequestBody ChangeRequestImplementationRequest request
    ) {
        return ResponseEntity.ok(changeRequestService.markImplemented(id, request));
    }

    // company download CR document
    @GetMapping("/company/change-requests/{id}/download")
    public ResponseEntity<byte[]> downloadChangeRequest(@PathVariable String id) {
        byte[] content = changeRequestService.generateChangeRequestDocument(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=change-request-" + id + ".txt")
                .body(content);
    }

    // company version-history table rows (projectId, prdId, clientId)
    @GetMapping("/company/version-history")
    public ResponseEntity<List<VersionHistoryTableRowResponse>> getVersionHistoryTableRows() {
        return ResponseEntity.ok(changeRequestService.getVersionHistoryTableRows());
    }

    // company version-history detail rows under view button
    @GetMapping("/company/version-history/projects/{projectId}/prds/{prdId}")
    public ResponseEntity<List<VersionHistoryEntryResponse>> getVersionHistoryEntries(
            @PathVariable String projectId,
            @PathVariable String prdId
    ) {
        return ResponseEntity.ok(changeRequestService.getVersionHistoryEntries(projectId, prdId));
    }
}