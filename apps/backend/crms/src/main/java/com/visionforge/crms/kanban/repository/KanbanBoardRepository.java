package com.visionforge.crms.kanban.repository;

import com.visionforge.crms.kanban.model.KanbanBoard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KanbanBoardRepository extends MongoRepository<KanbanBoard, String> {
    Optional<KanbanBoard> findByProjectId(String projectId);
    
    List<KanbanBoard> findByCompanyId(String companyId);
    
    Optional<KanbanBoard> findByProjectIdAndCompanyId(String projectId, String companyId);
}
