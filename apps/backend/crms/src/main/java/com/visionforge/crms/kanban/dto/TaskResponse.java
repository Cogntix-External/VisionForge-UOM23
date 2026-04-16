package com.visionforge.crms.kanban.dto;

import com.visionforge.crms.kanban.model.TaskStatus;
import com.visionforge.crms.kanban.model.Task;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private String id;
    private String projectId;
    private String boardId;
    private String companyId;
    private String title;
    private String description;
    private TaskStatus status;
    private String assignedTo;
    private String createdBy;
    private LocalDateTime dueDate;
    private String priority;
    private List<TaskCommentDTO> comments;
    private List<String> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer completionPercentage;
    
    public static TaskResponse from(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setProjectId(task.getProjectId());
        response.setBoardId(task.getBoardId());
        response.setCompanyId(task.getCompanyId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setAssignedTo(task.getAssignedTo());
        response.setCreatedBy(task.getCreatedBy());
        response.setDueDate(task.getDueDate());
        response.setPriority(task.getPriority());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        response.setCompletionPercentage(task.getCompletionPercentage());
        response.setAttachments(task.getAttachments() != null ? task.getAttachments() : new ArrayList<>());
        
        List<TaskCommentDTO> commentDTOs = new ArrayList<>();
        if (task.getComments() != null) {
            for (Task.TaskComment comment : task.getComments()) {
                commentDTOs.add(TaskCommentDTO.from(comment));
            }
        }
        response.setComments(commentDTOs);
        
        return response;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskCommentDTO {
        private String id;
        private String userId;
        private String userName;
        private String comment;
        private LocalDateTime createdAt;
        
        public static TaskCommentDTO from(Task.TaskComment comment) {
            return new TaskCommentDTO(comment.getId(), comment.getUserId(), comment.getUserName(),
                    comment.getComment(), comment.getCreatedAt());
        }
    }
}
