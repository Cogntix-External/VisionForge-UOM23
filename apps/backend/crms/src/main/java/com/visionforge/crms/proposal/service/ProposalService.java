package com.visionforge.crms.proposal.service;

import com.visionforge.crms.proposal.dto.CreateProposalRequest;
import com.visionforge.crms.proposal.dto.ProposalResponse;
import com.visionforge.crms.proposal.model.Proposal;
import com.visionforge.crms.proposal.repository.ProposalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProposalService {

    private final ProposalRepository proposalRepository;

    // ── Create Proposal ────────────────────────────────────────────
    public ProposalResponse createProposal(CreateProposalRequest request, String companyId) {
        Proposal proposal = Proposal.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .clientId(request.getClientId())
                .companyId(companyId)
                .build();

        Proposal saved = proposalRepository.save(proposal);
        return mapToResponse(saved);
    }

    // ── Company: Get All Proposals ─────────────────────────────────
    public List<ProposalResponse> getProposalsByCompany(String companyId) {
        return proposalRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Client: Get All Proposals ──────────────────────────────────
    public List<ProposalResponse> getProposalsByClient(String clientId) {
        return proposalRepository.findByClientId(clientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Get Single Proposal ────────────────────────────────────────
    public ProposalResponse getProposalById(String proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found: " + proposalId));
        return mapToResponse(proposal);
    }

    // ── Accept Proposal ────────────────────────────────────────────
    public ProposalResponse acceptProposal(String proposalId, String clientId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        validateClientOwnership(proposal, clientId);

        proposal.setStatus(Proposal.ProposalStatus.ACCEPTED);
        proposal.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(proposalRepository.save(proposal));
    }

    // ── Reject Proposal ────────────────────────────────────────────
    public ProposalResponse rejectProposal(String proposalId, String clientId, String rejectionReason) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        validateClientOwnership(proposal, clientId);

        proposal.setStatus(Proposal.ProposalStatus.REJECTED);
        proposal.setRejectionReason(rejectionReason);
        proposal.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(proposalRepository.save(proposal));
    }

    // ── Private Helpers ────────────────────────────────────────────
    private void validateClientOwnership(Proposal proposal, String clientId) {
        if (!proposal.getClientId().equals(clientId)) {
            throw new RuntimeException("Unauthorized: proposal does not belong to this client");
        }
    }

    private ProposalResponse mapToResponse(Proposal proposal) {
        return ProposalResponse.builder()
                .id(proposal.getId())
                .title(proposal.getTitle())
                .description(proposal.getDescription())
                .clientId(proposal.getClientId())
                .companyId(proposal.getCompanyId())
                .status(proposal.getStatus())
                .rejectionReason(proposal.getRejectionReason())
                .createdAt(proposal.getCreatedAt())
                .updatedAt(proposal.getUpdatedAt())
                .build();
    }
}