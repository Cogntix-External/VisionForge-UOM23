package com.visionforge.crms.prd.controller;

import com.visionforge.crms.prd.dto.CreatePrdRequest;
import com.visionforge.crms.prd.dto.PrdResponse;
import com.visionforge.crms.prd.dto.UpdatePrdRequest;
import com.visionforge.crms.prd.service.PrdService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrdControllerTest {

    @Mock
    private PrdService prdService;

    @InjectMocks
    private PrdController prdController;

    @Test
    void shouldReturnClientProjectPrd() {
        PrdResponse response = PrdResponse.builder()
                .id("prd-1")
                .projectId("project-1")
                .title("CRMS PRD")
                .status("Approved")
                .version("1.0")
                .build();

        when(prdService.getPrdByProjectId("project-1")).thenReturn(response);

        ResponseEntity<PrdResponse> result =
                prdController.getClientProjectPrd("project-1");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isEqualTo(response);
        assertThat(result.getBody().getId()).isEqualTo("prd-1");
        assertThat(result.getBody().getProjectId()).isEqualTo("project-1");
    }

    @Test
    void getPrdsReturnsOk() {
        PrdResponse response = PrdResponse.builder()
                .id("prd-1")
                .title("PRD 1")
                .build();

        when(prdService.getAllPrds()).thenReturn(List.of(response));

        ResponseEntity<List<PrdResponse>> result = prdController.getPrds();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).containsExactly(response);
    }

    @Test
    void getPrdByIdReturnsOk() {
        PrdResponse response = PrdResponse.builder()
                .id("prd-1")
                .title("PRD 1")
                .build();

        when(prdService.getPrdById("prd-1")).thenReturn(response);

        ResponseEntity<PrdResponse> result = prdController.getPrdById("prd-1");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void createPrdReturnsCreated() {
        CreatePrdRequest request = new CreatePrdRequest();

        PrdResponse response = PrdResponse.builder()
                .id("prd-2")
                .build();

        when(prdService.createPrd(any(CreatePrdRequest.class))).thenReturn(response);

        ResponseEntity<PrdResponse> result = prdController.createPrd(request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void updatePrdReturnsOk() {
        UpdatePrdRequest request = new UpdatePrdRequest();

        PrdResponse response = PrdResponse.builder()
                .id("prd-3")
                .build();

        when(prdService.updatePrd("prd-3", request)).thenReturn(response);

        ResponseEntity<PrdResponse> result =
                prdController.updatePrd("prd-3", request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void downloadDocumentReturnsPdfResponse() {
        byte[] content = "%PDF-1.4 test pdf content"
                .getBytes(StandardCharsets.UTF_8);

        when(prdService.generatePrdDocument("prd-1")).thenReturn(content);

        ResponseEntity<byte[]> result = prdController.downloadDocument("prd-1");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getHeaders().getContentType())
                .isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(result.getHeaders().getContentLength())
                .isEqualTo(content.length);
        assertThat(result.getBody()).isEqualTo(content);
        assertThat(result.getHeaders().getFirst("Content-Disposition"))
                .contains("prd-document-prd-1.pdf");
    }

    @Test
    void downloadDocumentReturnsServerErrorWhenServiceFails() {
        when(prdService.generatePrdDocument("prd-1"))
                .thenThrow(new RuntimeException("boom"));

        ResponseEntity<byte[]> result = prdController.downloadDocument("prd-1");

        assertThat(result.getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}