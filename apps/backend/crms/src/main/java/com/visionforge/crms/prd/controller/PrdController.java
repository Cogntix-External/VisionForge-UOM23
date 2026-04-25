package com.visionforge.crms.prd.controller;

import com.visionforge.crms.prd.dto.PrdResponse;
import com.visionforge.crms.prd.service.PrdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.visionforge.crms.prd.dto.CreatePrdRequest;
import com.visionforge.crms.prd.dto.UpdatePrdRequest;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PrdController {

    private final PrdService prdService;

    // client side - get PRD by project id
    @GetMapping("/client/projects/{projectId}/prd")
    public ResponseEntity<PrdResponse> getClientProjectPrd(@PathVariable String projectId) {
    PrdResponse response = prdService.getPrdByProjectId(projectId);
    return ResponseEntity.ok(response);
}
    
// Downloads the generated PRD as a real PDF file
@GetMapping("/documents/{documentId}/download")
public ResponseEntity<byte[]> downloadDocument(@PathVariable String documentId) {
    try {
        byte[] content = prdService.generatePrdDocument(documentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData(
                "attachment",
                "prd-document-" + documentId + ".pdf"
        );
        headers.setContentLength(content.length);

        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
    
    @GetMapping
    public ResponseEntity<List<PrdResponse>> getPrds() {
        return ResponseEntity.ok(prdService.getAllPrds());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrdResponse> getPrdById(@PathVariable String id) {
        return ResponseEntity.ok(prdService.getPrdById(id));
    }

    @PostMapping
    public ResponseEntity<PrdResponse> createPrd(@RequestBody CreatePrdRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(prdService.createPrd(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrdResponse> updatePrd(@PathVariable String id, @RequestBody UpdatePrdRequest request) {
        return ResponseEntity.ok(prdService.updatePrd(id, request));
    }
}
