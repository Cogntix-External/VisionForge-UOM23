package com.visionforge.crms.proposal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "proposals")
public class Proposal {

    @Id
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