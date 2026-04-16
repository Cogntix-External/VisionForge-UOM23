package com.visionforge.crms.kanban.dto;

import com.visionforge.crms.kanban.model.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskStatusRequest {
    private TaskStatus status;
    private Integer completionPercentage;
}
