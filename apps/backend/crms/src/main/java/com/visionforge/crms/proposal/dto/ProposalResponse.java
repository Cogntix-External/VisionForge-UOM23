package com.visionforge.crms.proposal.dto;

import com.visionforge.crms.proposal.model.Proposal.ProposalStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProposalResponse {

    private String id;
    private String title;
    private String description;
    private String clientId;
    private String companyId;
    private ProposalStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}