package com.visionforge.crms.kanban.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class KanbanBoardResponse {
    private String id;
    private String projectId;
    private String clientId;
    private String companyId;
    private List<KanbanColumnResponse> columns;
}