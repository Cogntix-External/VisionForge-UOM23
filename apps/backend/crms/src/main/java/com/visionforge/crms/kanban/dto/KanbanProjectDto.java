package com.visionforge.crms.kanban.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class KanbanProjectDto {

    private String id;
    private String name;
    private String description;
}
