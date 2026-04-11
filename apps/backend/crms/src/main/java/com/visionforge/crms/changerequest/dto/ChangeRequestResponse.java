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
    private String clientId;
    private String companyId;

    private String title;
    private String description;
    private Double budget;
    private String timeline;
    private String priority;

    private ChangeRequestStatus status;
    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}