package com.visionforge.crms.kanban.repository;

import com.visionforge.crms.kanban.model.Task;
import com.visionforge.crms.kanban.model.TaskStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByBoardId(String boardId);
    
    List<Task> findByProjectId(String projectId);
    
    List<Task> findByProjectIdAndCompanyId(String projectId, String companyId);
    
    List<Task> findByAssignedTo(String assignedTo);
    
    List<Task> findByBoardIdAndStatus(String boardId, TaskStatus status);
    
    List<Task> findByCompanyId(String companyId);
    
    List<Task> findByProjectIdAndStatus(String projectId, TaskStatus status);
    
    Long countByBoardIdAndStatus(String boardId, TaskStatus status);
}
