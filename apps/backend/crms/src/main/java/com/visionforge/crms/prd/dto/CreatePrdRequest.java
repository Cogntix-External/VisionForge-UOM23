package com.visionforge.crms.prd.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreatePrdRequest {

    private String projectName;
    private String author;
    private String dateSubmitted;

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
    public static class StakeholderDto {
        private String role;
        private String name;
        private String responsibility;
    }

    @Data
    public static class MilestoneDto {
        private String phase;
        private String task;
        private String duration;
        private String responsibility;
    }
}
