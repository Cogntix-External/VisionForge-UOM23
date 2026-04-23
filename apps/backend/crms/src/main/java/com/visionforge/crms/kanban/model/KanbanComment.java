package com.visionforge.crms.kanban.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanComment {

    private String id;
    private String userId;
    private String userName;
    private String comment;
    private Instant createdAt;
}
