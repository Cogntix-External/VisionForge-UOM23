package com.visionforge.crms.proposal.service;

import com.visionforge.crms.project.service.ProjectService;
import com.visionforge.crms.proposal.dto.CreateProposalRequest;
import com.visionforge.crms.proposal.dto.ProposalDecisionRequest;
import com.visionforge.crms.proposal.dto.ProposalResponse;
import com.visionforge.crms.proposal.model.Proposal;
import com.visionforge.crms.proposal.model.ProposalStatus;
import com.visionforge.crms.proposal.repository.ProposalRepository;
import com.visionforge.crms.user.CurrentUserService;
import com.visionforge.crms.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final CurrentUserService currentUserService;
    private final ProjectService projectService;

    // Company create proposal
    public ProposalResponse createProposal(CreateProposalRequest request, String companyId) {
        Proposal proposal = Proposal.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .clientId(request.getClientId())
                .clientName(request.getClientName())
                .totalBudget(request.getTotalBudget())
                .totalDurationDays(request.getTotalDurationDays())
                .companyId(companyId)
                .status(ProposalStatus.PENDING)
                .rejectionReason(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Proposal savedProposal = proposalRepository.save(proposal);
        return mapToResponse(savedProposal);
    }

    // Company proposals
    public List<ProposalResponse> getProposalsByCompany(String companyId) {
        return proposalRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Client proposals - JWT based
    public List<ProposalResponse> getCurrentClientProposals() {
        if (currentUserService.getCurrentUserRole() != Role.CLIENT) {
            throw new RuntimeException("Only client can access client proposals");
        }

        String clientId = currentUserService.getCurrentUserId();

        return proposalRepository.findByClientId(clientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Single proposal detail for logged-in client only
    public ProposalResponse getCurrentClientProposalById(String proposalId) {
        if (currentUserService.getCurrentUserRole() != Role.CLIENT) {
            throw new RuntimeException("Only client can view proposal details");
        }

        String clientId = currentUserService.getCurrentUserId();

        Proposal proposal = proposalRepository.findByIdAndClientId(proposalId, clientId)
                .orElseThrow(() -> new RuntimeException("Proposal not found for this client"));

        return mapToResponse(proposal);
    }

    // Accept proposal
    public ProposalResponse acceptCurrentClientProposal(String proposalId) {
        if (currentUserService.getCurrentUserRole() != Role.CLIENT) {
            throw new RuntimeException("Only client can accept proposal");
        }

        String clientId = currentUserService.getCurrentUserId();

        Proposal proposal = proposalRepository.findByIdAndClientId(proposalId, clientId)
                .orElseThrow(() -> new RuntimeException("Proposal not found for this client"));

        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new RuntimeException("Only pending proposals can be accepted");
        }

        proposal.setStatus(ProposalStatus.ACCEPTED);
        proposal.setRejectionReason(null);
        proposal.setUpdatedAt(LocalDateTime.now());

        Proposal savedProposal = proposalRepository.save(proposal);

        System.out.println("Accepted proposal ID: " + savedProposal.getId());
        System.out.println("Creating project for client ID: " + savedProposal.getClientId());
        System.out.println("Creating project for company ID: " + savedProposal.getCompanyId());

        projectService.createProjectFromProposal(savedProposal);

        System.out.println("Project created successfully for proposal ID: " + savedProposal.getId());

        return mapToResponse(savedProposal);
    }

    // Reject proposal
    public ProposalResponse rejectCurrentClientProposal(String proposalId, ProposalDecisionRequest request) {
        if (currentUserService.getCurrentUserRole() != Role.CLIENT) {
            throw new RuntimeException("Only client can reject proposal");
        }

        String clientId = currentUserService.getCurrentUserId();

        Proposal proposal = proposalRepository.findByIdAndClientId(proposalId, clientId)
                .orElseThrow(() -> new RuntimeException("Proposal not found for this client"));

        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new RuntimeException("Only pending proposals can be rejected");
        }

        proposal.setStatus(ProposalStatus.REJECTED);
        proposal.setRejectionReason(
                request.getRejectionReason() == null || request.getRejectionReason().isBlank()
                        ? "No reason provided"
                        : request.getRejectionReason());
        proposal.setUpdatedAt(LocalDateTime.now());

        Proposal savedProposal = proposalRepository.save(proposal);
        return mapToResponse(savedProposal);
    }

    private ProposalResponse mapToResponse(Proposal proposal) {
        return ProposalResponse.builder()
                .id(proposal.getId())
                .title(proposal.getTitle())
                .description(proposal.getDescription())
                .clientId(proposal.getClientId())
                .clientName(proposal.getClientName())
                .totalBudget(proposal.getTotalBudget())
                .totalDurationDays(proposal.getTotalDurationDays())
                .companyId(proposal.getCompanyId())
                .status(proposal.getStatus())
                .rejectionReason(proposal.getRejectionReason())
                .createdAt(proposal.getCreatedAt())
                .updatedAt(proposal.getUpdatedAt())
                .build();
    }
}