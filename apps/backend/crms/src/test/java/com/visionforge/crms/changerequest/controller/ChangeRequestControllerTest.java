package com.visionforge.crms.changerequest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visionforge.crms.changerequest.dto.ChangeRequestDecisionRequest;
import com.visionforge.crms.changerequest.dto.ChangeRequestResponse;
import com.visionforge.crms.changerequest.dto.CreateChangeRequestRequest;
import com.visionforge.crms.changerequest.dto.VersionHistoryEntryResponse;
import com.visionforge.crms.changerequest.model.ChangeRequestStatus;
import com.visionforge.crms.changerequest.service.ChangeRequestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChangeRequestControllerTest {

    @Mock
    private ChangeRequestService changeRequestService;

    @InjectMocks
    private ChangeRequestController changeRequestController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void shouldCreateClientChangeRequest() {
        CreateChangeRequestRequest request = new CreateChangeRequestRequest();
        request.setTitle("Update UI");
        request.setDescription("Improve dashboard UI");
        request.setBudget(2000.0);
        request.setTimeline("2 weeks");
        request.setPriority("Medium");

        ChangeRequestResponse response = ChangeRequestResponse.builder()
                .id("cr-1")
                .projectId("project-1")
                .clientId("client-1")
                .title("Update UI")
                .status(ChangeRequestStatus.PENDING)
                .build();

        when(changeRequestService.createChangeRequest("project-1", request))
                .thenReturn(response);

        ResponseEntity<ChangeRequestResponse> result =
                changeRequestController.createChangeRequest("project-1", request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(result.getBody()).isEqualTo(response);
        assertThat(result.getBody().getId()).isEqualTo("cr-1");
        assertThat(result.getBody().getStatus()).isEqualTo(ChangeRequestStatus.PENDING);
    }

    @Test
    void getCompanyChangeRequestsReturnsOk() {
        ChangeRequestResponse response = sampleResponse();

        when(changeRequestService.getCurrentCompanyChangeRequests())
                .thenReturn(List.of(response));

        ResponseEntity<List<ChangeRequestResponse>> result =
                changeRequestController.getCompanyChangeRequests();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).containsExactly(response);
    }

    @Test
    void acceptChangeRequestReturnsOk() {
        ChangeRequestResponse response = sampleResponse();

        when(changeRequestService.acceptChangeRequest("cr-1"))
                .thenReturn(response);

        ResponseEntity<ChangeRequestResponse> result =
                changeRequestController.acceptChangeRequest("cr-1");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void decideChangeRequestReturnsOk() {
        ChangeRequestDecisionRequest request = new ChangeRequestDecisionRequest();
        request.setAccepted(Boolean.FALSE);
        request.setRejectionReason("Not enough detail");

        when(changeRequestService.decideChangeRequest("cr-1", request))
                .thenReturn(sampleResponse());

        ResponseEntity<ChangeRequestResponse> result =
                changeRequestController.decideChangeRequest("cr-1", request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getStatus()).isEqualTo(ChangeRequestStatus.PENDING);
    }

    @Test
    void downloadChangeRequestReturnsDocumentBytes() {
        byte[] content = "change request".getBytes(StandardCharsets.UTF_8);

        when(changeRequestService.generateChangeRequestDocument("cr-1"))
                .thenReturn(content);

        ResponseEntity<byte[]> result =
                changeRequestController.downloadChangeRequest("cr-1");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isEqualTo(content);
        assertThat(new String(result.getBody(), StandardCharsets.UTF_8))
                .isEqualTo("change request");
    }

    @Test
    void getVersionHistoryEntriesReturnsRows() {
        VersionHistoryEntryResponse entry = VersionHistoryEntryResponse.builder()
                .changeRequestId("cr-1")
                .build();

        when(changeRequestService.getVersionHistoryEntries("project-1", "prd-1"))
                .thenReturn(List.of(entry));

        ResponseEntity<List<VersionHistoryEntryResponse>> result =
                changeRequestController.getVersionHistoryEntries("project-1", "prd-1");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).containsExactly(entry);
    }

    private ChangeRequestResponse sampleResponse() {
        return ChangeRequestResponse.builder()
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
                .status(ChangeRequestStatus.PENDING)
                .decisionReason(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}