package com.visionforge.crms.project.dto;

import com.visionforge.crms.project.model.Project.ProjectStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectResponse {

    private String id;
    private String name;
    private String description;
    private String proposalId;
    private String clientId;
    private String clientName;
    private String companyId;
    private ProjectStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}