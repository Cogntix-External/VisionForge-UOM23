package com.visionforge.crms.changerequest.controller;

import com.visionforge.crms.changerequest.dto.ChangeRequestDecisionRequest;
import com.visionforge.crms.changerequest.dto.ChangeRequestResponse;
import com.visionforge.crms.changerequest.dto.CreateChangeRequestRequest;
import com.visionforge.crms.changerequest.service.ChangeRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    // company received CR list
    @GetMapping("/company/change-requests")
    public ResponseEntity<List<ChangeRequestResponse>> getCompanyChangeRequests() {
        return ResponseEntity.ok(changeRequestService.getCurrentCompanyChangeRequests());
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
}