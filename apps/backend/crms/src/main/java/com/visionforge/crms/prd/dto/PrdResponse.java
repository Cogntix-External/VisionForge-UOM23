package com.visionforge.crms.prd.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PrdResponse {

    private String id;
    private String pid;
    private String title;
    private String status;
    private String version;
    private String createdDate;

    private boolean reviewedByChecker;
    private boolean sentToClient;

    private String projectName;
    private String author;
    private String dateSubmitted;
    private String reviewerName;

    private String purpose;
    private String problemToSolve;
    private String projectGoal;

    private List<StakeholderDto> stakeholders;

    private String inScope;
    private String outOfScope;

    private String mainFeatures;
    private String functionalRequirement;
    private String nonFunctionalRequirement;

    private String userRoles;
    private String risksDependencies;

    private List<MilestoneDto> milestones;

    @Data
    @Builder
    public static class StakeholderDto {
        private String role;
        private String name;
        private String responsibility;
    }

    @Data
    @Builder
    public static class MilestoneDto {
        private String phase;
        private String task;
        private String duration;
        private String responsibility;
    }
}
