package com.visionforge.crms.proposal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    private String companyId;
    @Builder.Default
    private ProposalStatus status = ProposalStatus.PENDING;

    private String rejectionReason;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @Builder.Default
    private List<ProposalStageHistory> stageHistory = new ArrayList<>();

    public enum ProposalStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}