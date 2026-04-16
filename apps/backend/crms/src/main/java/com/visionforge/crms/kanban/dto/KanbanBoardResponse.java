package com.visionforge.crms.kanban.dto;

import com.visionforge.crms.kanban.model.KanbanBoard;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanBoardResponse {
    private String id;
    private String projectId;
    private String companyId;
    private String name;
    private String description;
    private List<String> taskIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    
    public static KanbanBoardResponse from(KanbanBoard board) {
        KanbanBoardResponse response = new KanbanBoardResponse();
        response.setId(board.getId());
        response.setProjectId(board.getProjectId());
        response.setCompanyId(board.getCompanyId());
        response.setName(board.getName());
        response.setDescription(board.getDescription());
        response.setTaskIds(board.getTaskIds());
        response.setCreatedAt(board.getCreatedAt());
        response.setUpdatedAt(board.getUpdatedAt());
        response.setCreatedBy(board.getCreatedBy());
        return response;
    }
}
