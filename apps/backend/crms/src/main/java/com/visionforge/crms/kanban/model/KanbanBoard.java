package com.visionforge.crms.kanban.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "kanban_boards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanBoard {

    @Id
    private String id;

    private String projectId;
    private String title;
}
