package com.visionforge.crms.proposal.controller;

import com.visionforge.crms.proposal.dto.CreateProposalRequest;
import com.visionforge.crms.proposal.dto.ProposalResponse;
import com.visionforge.crms.proposal.service.ProposalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.visionforge.crms.proposal.dto.ProposalDecisionRequest;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProposalController {

    private final ProposalService proposalService;

    // ── POST /api/company/proposals ────────────────────────────────
    @PostMapping("/company/proposals")
    public ResponseEntity<ProposalResponse> createProposal(
            @Valid @RequestBody CreateProposalRequest request,
            @RequestHeader("X-Company-Id") String companyId
    ) {
        ProposalResponse response = proposalService.createProposal(request, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /api/company/proposals ─────────────────────────────────
    @GetMapping("/company/proposals")
    public ResponseEntity<List<ProposalResponse>> getCompanyProposals(
            @RequestHeader("X-Company-Id") String companyId
    ) {
        return ResponseEntity.ok(proposalService.getProposalsByCompany(companyId));
    }

    // ── GET /api/client/proposals ──────────────────────────────────
    @GetMapping("/client/proposals")
    public ResponseEntity<List<ProposalResponse>> getClientProposals(
            @RequestHeader("X-Client-Id") String clientId
    ) {
        return ResponseEntity.ok(proposalService.getProposalsByClient(clientId));
    }

    // ── GET /api/proposals/{id} ────────────────────────────────────
    @GetMapping("/proposals/{id}")
    public ResponseEntity<ProposalResponse> getProposalById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(proposalService.getProposalById(id));
    }

    // ── PATCH /api/client/proposals/{id}/accept ────────────────────
    @PatchMapping("/client/proposals/{id}/accept")
    public ResponseEntity<ProposalResponse> acceptProposal(
            @PathVariable String id,
            @RequestHeader("X-Client-Id") String clientId
    ) {
        return ResponseEntity.ok(proposalService.acceptProposal(id, clientId));
    }

    // ── PATCH /api/client/proposals/{id}/reject ────────────────────
    @PatchMapping("/client/proposals/{id}/reject")
    public ResponseEntity<ProposalResponse> rejectProposal(
            @PathVariable String id,
            @RequestHeader("X-Client-Id") String clientId,
            @RequestBody ProposalDecisionRequest request
    ) {
        return ResponseEntity.ok(proposalService.rejectProposal(id, clientId, request.getReason()));
    }
}