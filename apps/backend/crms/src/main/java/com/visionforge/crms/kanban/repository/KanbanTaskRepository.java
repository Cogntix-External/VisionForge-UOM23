package com.visionforge.crms.kanban.repository;

import com.visionforge.crms.kanban.model.KanbanTask;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface KanbanTaskRepository extends MongoRepository<KanbanTask, String> {

    List<KanbanTask> findByProjectId(String projectId);

    List<KanbanTask> findByBoardId(String boardId);

    List<KanbanTask> findByAssignedTo(String assignedTo);
}
