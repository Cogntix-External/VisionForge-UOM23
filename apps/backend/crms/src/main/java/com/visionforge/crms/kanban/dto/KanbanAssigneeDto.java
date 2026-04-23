package com.visionforge.crms.kanban.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class KanbanAssigneeDto {

    private String id;
    private String name;
    private String email;
}
