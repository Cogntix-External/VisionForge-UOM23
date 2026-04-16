package com.visionforge.crms.kanban.repository;

import com.visionforge.crms.kanban.model.TaskAttachment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskAttachmentRepository extends MongoRepository<TaskAttachment, String> {
    List<TaskAttachment> findByTaskId(String taskId);

    void deleteByTaskId(String taskId);
}
