package com.visionforge.crms.project.dto;

import com.visionforge.crms.changerequest.dto.ChangeRequestResponse;
import com.visionforge.crms.project.model.Project.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private String id;
    private String name;
    private String description;
    private String proposalId;
    private String clientId;
    private String clientName;
    private String companyId;

    // important for frontend
    private ProjectStatus status;
    private Double budget;
    private String timeline;
    private Integer progress;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 🔥 add this
    private List<ChangeRequestResponse> changeRequests;
}