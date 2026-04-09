package com.visionforge.crms.proposal.dto;

import com.visionforge.crms.proposal.model.ProposalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposalResponse {
    private String id;
    private String title;
    private String description;
    private String clientId;
    private String clientName;
    private Double totalBudget;
    private Integer totalDurationDays;
    private String companyId;
    private ProposalStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}