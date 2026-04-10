package com.visionforge.crms.prd.dto;

import lombok.Data;

import java.util.List;

@Data
public class UpdatePrdRequest {

    private String projectName;
    private String author;
    private String dateSubmitted;
    private String reviewerName;

    private String purpose;
    private String problemToSolve;
    private String projectGoal;

    private List<CreatePrdRequest.StakeholderDto> stakeholders;

    private String inScope;
    private String outOfScope;

    private String mainFeatures;
    private String functionalRequirement;
    private String nonFunctionalRequirement;

    private String userRoles;
    private String risksDependencies;

    private List<CreatePrdRequest.MilestoneDto> milestones;

    private String action;
}
