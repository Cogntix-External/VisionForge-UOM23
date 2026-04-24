package com.visionforge.crms.kanban.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanbanColumn {
    private String id;
    private String title;

    @Builder.Default
    private List<KanbanTask> tasks = new ArrayList<>();
}