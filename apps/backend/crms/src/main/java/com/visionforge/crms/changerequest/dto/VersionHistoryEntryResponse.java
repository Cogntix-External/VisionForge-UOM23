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
public class VersionHistoryEntryResponse {
    private String changeRequestId;
    private String projectId;
    private String prdId;
    private String clientId;
    private String title;
    private String description;
    private ChangeRequestStatus status;
    private String decisionReason;
    private String rejectionReason;
    private String implementedVersion;
    private String implementationNotes;
    private LocalDateTime createdAt;
    private LocalDateTime decidedAt;
    private LocalDateTime implementedAt;
    private LocalDateTime updatedAt;
}