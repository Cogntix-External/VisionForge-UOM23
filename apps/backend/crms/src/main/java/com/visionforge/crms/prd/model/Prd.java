package com.visionforge.crms.prd.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "prds")
public class Prd {

    @Id
    private String id;

    private String projectId;
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

    @Builder.Default
    private List<Stakeholder> stakeholders = new ArrayList<>();

    private String inScope;
    private String outOfScope;

    private String mainFeatures;
    private String functionalRequirement;
    private String nonFunctionalRequirement;

    private String userRoles;
    private String risksDependencies;

    @Builder.Default
    private List<Milestone> milestones = new ArrayList<>();

    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Stakeholder {
        private String role;
        private String name;
        private String responsibility;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Milestone {
        private String phase;
        private String task;
        private String duration;
        private String responsibility;
    }
}
