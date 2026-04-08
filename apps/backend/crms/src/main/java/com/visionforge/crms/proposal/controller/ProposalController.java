package com.visionforge.crms.proposal.controller;

import com.visionforge.crms.proposal.dto.CreateProposalRequest;
import com.visionforge.crms.proposal.dto.ProposalDecisionRequest;
import com.visionforge.crms.proposal.dto.ProposalResponse;
import com.visionforge.crms.proposal.service.ProposalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProposalController {

    private final ProposalService proposalService;

    // company create
    @PostMapping("/company/proposals")
    public ResponseEntity<ProposalResponse> createProposal(
            @Valid @RequestBody CreateProposalRequest request,
            @RequestHeader("X-Company-Id") String companyId
    ) {
        ProposalResponse response = proposalService.createProposal(request, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // company list
    @GetMapping("/company/proposals")
    public ResponseEntity<List<ProposalResponse>> getCompanyProposals(
            @RequestHeader("X-Company-Id") String companyId
    ) {
        return ResponseEntity.ok(proposalService.getProposalsByCompany(companyId));
    }

    // client list - JWT based
    @GetMapping("/client/proposals")
    public ResponseEntity<List<ProposalResponse>> getClientProposals() {
        return ResponseEntity.ok(proposalService.getCurrentClientProposals());
    }

    // client one proposal detail
    @GetMapping("/client/proposals/{id}")
    public ResponseEntity<ProposalResponse> getClientProposalById(@PathVariable String id) {
        return ResponseEntity.ok(proposalService.getCurrentClientProposalById(id));
    }

    // client accept
    @PatchMapping("/client/proposals/{id}/accept")
    public ResponseEntity<ProposalResponse> acceptProposal(@PathVariable String id) {
        return ResponseEntity.ok(proposalService.acceptCurrentClientProposal(id));
    }

    // client reject
    @PatchMapping("/client/proposals/{id}/reject")
    public ResponseEntity<ProposalResponse> rejectProposal(
            @PathVariable String id,
            @RequestBody ProposalDecisionRequest request
    ) {
        return ResponseEntity.ok(proposalService.rejectCurrentClientProposal(id, request));
    }
}