package com.visionforge.crms.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CompanyDashboardResponse {

    private long totalProjects;
    private long pendingApprovals;
    private long totalProposals;
    private long acceptedProposals;
    private long rejectedProposals;
    private long activeProjects;
    private List<ProjectTableRow> recentProjects;

    @Data
    @Builder
    public static class ProjectTableRow {
        private String id;
        private String projectName;
        private String status;
        private String owner;
        private String lastUpdated;
    }
}