package com.visionforge.crms.changerequest.model;

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
@Document(collection = "change_requests")
public class ChangeRequest {

    @Id
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

    private String attachmentId;
    private String attachmentName;
    private String attachmentContentType;
    private Long attachmentSize;
    private LocalDateTime attachmentUploadedAt;

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