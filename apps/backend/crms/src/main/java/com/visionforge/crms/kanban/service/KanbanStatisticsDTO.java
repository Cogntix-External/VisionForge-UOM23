package com.visionforge.crms.kanban.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanStatisticsDTO {
    private int totalTasks;
    private int todoTasks;
    private int inProgressTasks;
    private int inReviewTasks;
    private int doneTasks;
    private int blockedTasks;
    private int averageCompletion;
}
