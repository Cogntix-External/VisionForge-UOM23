package com.visionforge.crms.kanban.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {
    private String title;
    private String description;
    private String assignedTo;
    private LocalDateTime dueDate;
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    private Integer completionPercentage;
    private List<String> attachments;
}
