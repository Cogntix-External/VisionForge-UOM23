package com.visionforge.crms.proposal.service;

import com.visionforge.crms.proposal.dto.CreateProposalRequest;
import com.visionforge.crms.proposal.dto.ProposalResponse;
import com.visionforge.crms.proposal.model.Proposal;
import com.visionforge.crms.proposal.model.ProposalStageHistory;
import com.visionforge.crms.proposal.repository.ProposalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProposalService {

    private final ProposalRepository proposalRepository;

    // ── Create Proposal ────────────────────────────────────────────
    public ProposalResponse createProposal(CreateProposalRequest request, String companyId) {
        List<ProposalStageHistory> stageHistory = new ArrayList<>();
        
        // Add initial stage history entry
        stageHistory.add(ProposalStageHistory.builder()
                .stage("PENDING")
                .changedBy(companyId)
                .changeType("COMPANY_CREATED")
                .changedAt(LocalDateTime.now())
                .notes("Proposal created by company")
                .build());
        
        Proposal proposal = Proposal.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .clientId(request.getClientId())
                .companyId(companyId)
                .status(Proposal.ProposalStatus.PENDING)
                .rejectionReason(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .stageHistory(stageHistory)
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
          if (proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new RuntimeException("Only pending proposals can be accepted");
        }        

        validateClientOwnership(proposal, clientId);

        proposal.setStatus(Proposal.ProposalStatus.ACCEPTED);
        proposal.setRejectionReason(null);
        proposal.setUpdatedAt(LocalDateTime.now());
        
        // Add stage history entry
        proposal.getStageHistory().add(ProposalStageHistory.builder()
                .stage("ACCEPTED")
                .changedBy(clientId)
                .changeType("CLIENT_ACCEPTED")
                .changedAt(LocalDateTime.now())
                .notes("Proposal accepted by client")
                .build());

        return mapToResponse(proposalRepository.save(proposal));
    }

    // ── Reject Proposal ────────────────────────────────────────────
    public ProposalResponse rejectProposal(String proposalId, String clientId, String rejectionReason) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));
         if (proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new RuntimeException("Only pending proposals can be rejected");
        }
        validateClientOwnership(proposal, clientId);

        proposal.setStatus(Proposal.ProposalStatus.REJECTED);
        proposal.setRejectionReason(rejectionReason);
        proposal.setUpdatedAt(LocalDateTime.now());
        
        // Add stage history entry
        proposal.getStageHistory().add(ProposalStageHistory.builder()
                .stage("REJECTED")
                .changedBy(clientId)
                .changeType("CLIENT_REJECTED")
                .reason(rejectionReason)
                .changedAt(LocalDateTime.now())
                .notes("Proposal rejected by client")
                .build());

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
                .stageHistory(proposal.getStageHistory())
                .build();
    }
}