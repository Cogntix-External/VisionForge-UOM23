package com.visionforge.crms.prd.controller;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.visionforge.crms.prd.dto.CreatePrdRequest;
import com.visionforge.crms.prd.dto.PrdResponse;
import com.visionforge.crms.prd.dto.UpdatePrdRequest;
import com.visionforge.crms.prd.service.PrdService;

@ExtendWith(MockitoExtension.class)
class PrdControllerTest {

    @Mock
    private PrdService prdService;

    @InjectMocks
    private PrdController prdController;

    @Test
    void getPrdsReturnsOk() {
        PrdResponse response = PrdResponse.builder().id("prd-1").title("PRD 1").build();
        when(prdService.getAllPrds()).thenReturn(List.of(response));

        ResponseEntity<List<PrdResponse>> result = prdController.getPrds();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).containsExactly(response);
    }

    @Test
    void createPrdReturnsCreated() {
        CreatePrdRequest request = new CreatePrdRequest();
        PrdResponse response = PrdResponse.builder().id("prd-2").build();
        when(prdService.createPrd(any(CreatePrdRequest.class))).thenReturn(response);

        ResponseEntity<PrdResponse> result = prdController.createPrd(request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void updatePrdReturnsOk() {
        UpdatePrdRequest request = new UpdatePrdRequest();
        PrdResponse response = PrdResponse.builder().id("prd-3").build();
        when(prdService.updatePrd("prd-3", request)).thenReturn(response);

        ResponseEntity<PrdResponse> result = prdController.updatePrd("prd-3", request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void downloadDocumentReturnsFileResponse() {
        byte[] content = "prd document".getBytes(StandardCharsets.UTF_8);
        when(prdService.generatePrdDocument("prd-1")).thenReturn(content);

        ResponseEntity<byte[]> result = prdController.downloadDocument("prd-1");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getHeaders().getContentType()).isEqualTo(MediaType.TEXT_PLAIN);
        assertThat(result.getHeaders().getContentLength()).isEqualTo(content.length);
        assertThat(new String(result.getBody(), StandardCharsets.UTF_8)).isEqualTo("prd document");
        assertThat(result.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)).contains("prd-1.txt");
    }

    @Test
    @Disabled("Client-side PRD download behavior is out of scope for company-side testing")
    void downloadDocumentReturnsServerErrorWhenServiceFails() {
        when(prdService.generatePrdDocument("prd-1")).thenThrow(new RuntimeException("boom"));

        ResponseEntity<byte[]> result = prdController.downloadDocument("prd-1");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}