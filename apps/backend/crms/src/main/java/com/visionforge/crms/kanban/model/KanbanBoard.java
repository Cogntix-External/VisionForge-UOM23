package com.visionforge.crms.kanban.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "kanban_boards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanbanBoard {

    @Id
    private String id;

     @Builder.Default
    private List<KanbanColumn> columns = new ArrayList<>();

    private String projectId;
    private String title;
    private String clientId;
    private String companyId;

     private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
