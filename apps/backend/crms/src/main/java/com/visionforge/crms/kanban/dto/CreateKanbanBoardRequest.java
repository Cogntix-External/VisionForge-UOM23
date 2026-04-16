package com.visionforge.crms.kanban.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateKanbanBoardRequest {
    private String name;
    private String description;
}
