package com.visionforge.crms.kanban.dto;

import com.visionforge.crms.kanban.model.KanbanBoard;
import com.visionforge.crms.kanban.model.Task;
import com.visionforge.crms.kanban.model.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanBoardWithTasksResponse {

    private String id;
    private String projectId;
    private String companyId;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private List<TasksWithStatus> tasksByStatus;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TasksWithStatus {
        private TaskStatus status;
        private List<TaskResponse> tasks;

        public TasksWithStatus(TaskStatus status) {
            this.status = status;
            this.tasks = new ArrayList<>();
        }
    }

    public static KanbanBoardWithTasksResponse from(KanbanBoard board, List<Task> tasks) {
        KanbanBoardWithTasksResponse response = new KanbanBoardWithTasksResponse();

        response.setId(board.getId());
        response.setProjectId(board.getProjectId());
        response.setCompanyId(board.getCompanyId());
        response.setName(board.getName());
        response.setDescription(board.getDescription());
        response.setCreatedAt(board.getCreatedAt());
        response.setUpdatedAt(board.getUpdatedAt());
        response.setCreatedBy(board.getCreatedBy());

        List<TasksWithStatus> tasksByStatus = new ArrayList<>();

        for (TaskStatus status : TaskStatus.values()) {
            TasksWithStatus tws = new TasksWithStatus(status);

            tws.setTasks(
                tasks.stream()
                    .filter(task -> task.getStatus() == status)
                    .map(TaskResponse::from)
                    .collect(Collectors.toList())
            );

            tasksByStatus.add(tws);
        }

        response.setTasksByStatus(tasksByStatus);

        return response;
    }
}
