package com.visionforge.crms.kanban.repository;

import com.visionforge.crms.kanban.model.KanbanBoard;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface KanbanBoardRepository extends MongoRepository<KanbanBoard, String> {

    Optional<KanbanBoard> findByProjectId(String projectId);
    Optional<KanbanBoard> findByProjectIdAndClientId(String projectId, String clientId);
    Optional<KanbanBoard> findByProjectIdAndCompanyId(String projectId, String companyId);
}
