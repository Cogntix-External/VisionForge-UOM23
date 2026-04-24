package com.visionforge.crms.kanban.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class KanbanColumnResponse {
    private String id;
    private String title;
    private List<KanbanTaskResponse> tasks;
}