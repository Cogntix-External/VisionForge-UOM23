package com.visionforge.crms.kanban.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KanbanTaskResponse {
    private String id;
    private String title;
    private String description;
    private String priority;
    private String assignedTo;
}