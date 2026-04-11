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