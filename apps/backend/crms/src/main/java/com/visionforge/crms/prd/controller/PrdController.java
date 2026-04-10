package com.visionforge.crms.prd.controller;

import com.visionforge.crms.prd.dto.CreatePrdRequest;
import com.visionforge.crms.prd.dto.PrdResponse;
import com.visionforge.crms.prd.dto.UpdatePrdRequest;
import com.visionforge.crms.prd.service.PrdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clients/prds")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PrdController {

    private final PrdService prdService;

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
