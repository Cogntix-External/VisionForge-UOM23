package com.visionforge.crms.prd.controller;

import com.visionforge.crms.prd.dto.CreatePrdRequest;
import com.visionforge.crms.prd.dto.PrdResponse;
import com.visionforge.crms.prd.dto.UpdatePrdRequest;
import com.visionforge.crms.prd.service.PrdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PrdController {

    private final PrdService prdService;

    // CLIENT SIDE - GET PRD BY PROJECT ID
    @GetMapping("/client/projects/{projectId}/prd")
    public ResponseEntity<PrdResponse> getClientProjectPrd(@PathVariable String projectId) {
        PrdResponse response = prdService.getPrdByProjectId(projectId);

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }

    // COMPANY SIDE - GET ALL PRDS
    @GetMapping("/prds")
    public ResponseEntity<List<PrdResponse>> getPrds() {
        return ResponseEntity.ok(prdService.getAllPrds());
    }

    // COMPANY SIDE - GET PRD BY ID
    @GetMapping("/prds/{id}")
    public ResponseEntity<PrdResponse> getPrdById(@PathVariable String id) {
        return ResponseEntity.ok(prdService.getPrdById(id));
    }

    // COMPANY SIDE - CREATE PRD
    @PostMapping("/prds")
    public ResponseEntity<PrdResponse> createPrd(@RequestBody CreatePrdRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(prdService.createPrd(request));
    }

    // COMPANY SIDE - UPDATE PRD
    @PutMapping("/prds/{id}")
    public ResponseEntity<PrdResponse> updatePrd(
            @PathVariable String id,
            @RequestBody UpdatePrdRequest request
    ) {
        return ResponseEntity.ok(prdService.updatePrd(id, request));
    }

    // DOWNLOAD PRD DOCUMENT
    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable String documentId) {
        try {
            byte[] content = prdService.generatePrdDocument(documentId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename("PRD-" + documentId + ".pdf", StandardCharsets.UTF_8)
                            .build()
            );
            headers.setContentLength(content.length);

            return new ResponseEntity<>(content, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DELETE EMPTY/INCOMPLETE PRD
    @DeleteMapping("/prds/{id}/empty")
    public ResponseEntity<String> deleteEmptyPrd(@PathVariable String id) {
        prdService.deleteEmptyPrd(id);
        return ResponseEntity.ok("Empty PRD deleted successfully");
    }

    // CLEANUP ALL EMPTY PRDS
    @PostMapping("/prds/cleanup/empty")
    public ResponseEntity<String> cleanupEmptyPrds() {
        int deletedCount = prdService.cleanupEmptyPrds();
        return ResponseEntity.ok("Deleted " + deletedCount + " empty PRD(s)");
    }
}