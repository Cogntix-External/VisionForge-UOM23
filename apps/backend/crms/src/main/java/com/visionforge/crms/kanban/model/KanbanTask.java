package com.visionforge.crms.kanban.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "kanban_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanbanTask {

    @Id
    private String id;

    private String boardId;
    private String projectId;

    private String title;
    private String description;

    private String status;
    private String dueDate;
    private String priority;

    private String assignedTo;

    @Builder.Default
    private List<KanbanComment> comments = new ArrayList<>();

    @Builder.Default
    private List<KanbanAttachment> attachments = new ArrayList<>();
}