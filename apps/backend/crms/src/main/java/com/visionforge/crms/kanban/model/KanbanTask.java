package com.visionforge.crms.kanban.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "kanban_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanTask {

    @Id
    private String id;

    private String boardId;     
    private String projectId;   

    private String title;

    private String status;      
    private String dueDate;
    private String priority;    

    private String assignedTo;

    private List<KanbanComment> comments = new ArrayList<>();
    private List<KanbanAttachment> attachments = new ArrayList<>();
}
