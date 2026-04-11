package com.visionforge.crms.prd.controller;

import com.visionforge.crms.prd.dto.PrdResponse;
import com.visionforge.crms.prd.service.PrdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> getClientProjectPrd(
            @PathVariable String projectId
    ) {
        PrdResponse prd = prdService.getPrdByProjectId(projectId);
        if (prd == null) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok(prd);
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
