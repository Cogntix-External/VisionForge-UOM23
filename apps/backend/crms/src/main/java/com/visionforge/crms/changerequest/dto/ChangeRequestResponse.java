package com.visionforge.crms.changerequest.dto;

import com.visionforge.crms.changerequest.model.ChangeRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeRequestResponse {

    private String id;
    private String projectId;
    private String prdId;
    private String clientId;
    private String companyId;

    private String title;
    private String description;
    private Double budget;
    private String timeline;
    private String priority;

    private ChangeRequestStatus status;
    private String decisionReason;
    private LocalDateTime decidedAt;
    private String rejectionReason;

    private String implementedVersion;
    private String implementationNotes;
    private LocalDateTime implementedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}