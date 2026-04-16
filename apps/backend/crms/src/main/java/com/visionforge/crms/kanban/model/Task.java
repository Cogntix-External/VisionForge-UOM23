package com.visionforge.crms.kanban.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "kanban_tasks")
public class Task {
    
    @Id
    private String id;
    
    @Field("project_id")
    private String projectId;
    
    @Field("board_id")
    private String boardId;
    
    @Field("company_id")
    private String companyId;
    
    @Field("title")
    private String title;
    
    @Field("description")
    private String description;
    
    @Field("status")
    private TaskStatus status;
    
    @Field("assigned_to")
    private String assignedTo;
    
    @Field("created_by")
    private String createdBy;
    
    @Field("due_date")
    private LocalDateTime dueDate;
    
    @Field("priority")
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    
    @Field("comments")
    private List<TaskComment> comments = new ArrayList<>();
    
    @Field("attachments")
    private List<String> attachments = new ArrayList<>();
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    @Field("completion_percentage")
    private Integer completionPercentage = 0;
    
    public Task(String projectId, String boardId, String companyId, String title, 
                String description, String createdBy) {
        this.projectId = projectId;
        this.boardId = boardId;
        this.companyId = companyId;
        this.title = title;
        this.description = description;
        this.createdBy = createdBy;
        this.status = TaskStatus.TODO;
        this.priority = "MEDIUM";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.completionPercentage = 0;
        this.comments = new ArrayList<>();
        this.attachments = new ArrayList<>();
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskComment {
        private String id;
        private String userId;
        private String userName;
        private String comment;
        private LocalDateTime createdAt;
    }
}
