package com.visionforge.crms.project.model;

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
@Document(collection = "projects")
public class Project {

    @Id
    private String id;

    private String name;
    private String description;
    private String proposalId;

    private String clientId;
    private String clientName;

    private String companyId;

    // 🔥 NEW FIELDS (frontend project page ku)
    private Double budget;        // ex: 95000
    private String timeline;      // ex: "Jun 2024 - Jan 2025"
    private Integer progress;     // ex: 65

    @Builder.Default
    private ProjectStatus status = ProjectStatus.ACTIVE;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public enum ProjectStatus {
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
}