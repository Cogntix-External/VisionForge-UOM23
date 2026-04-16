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
@Document(collection = "kanban_boards")
public class KanbanBoard {
    
    @Id
    private String id;
    
    @Field("project_id")
    private String projectId;
    
    @Field("company_id")
    private String companyId;
    
    @Field("name")
    private String name;
    
    @Field("description")
    private String description;
    
    @Field("task_ids")
    private List<String> taskIds = new ArrayList<>();
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    @Field("created_by")
    private String createdBy;
    
    public KanbanBoard(String projectId, String companyId, String name, String description, String createdBy) {
        this.projectId = projectId;
        this.companyId = companyId;
        this.name = name;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.taskIds = new ArrayList<>();
    }
}
