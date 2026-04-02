package com.visionforge.crms.proposal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposalStageHistory {

    private String stage; // PENDING, ACCEPTED, REJECTED
    private String changedBy; // Client ID or Company ID who made the change
    private String changeType; // CLIENT_ACCEPTED, CLIENT_REJECTED, COMPANY_CREATED, COMPANY_UPDATED, etc.
    private String reason; // For rejection reason
    private LocalDateTime changedAt;
    private String notes; // Additional notes if any
}
