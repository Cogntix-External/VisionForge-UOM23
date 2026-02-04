package com.visionforge.crms.repository;

import com.visionforge.crms.model.ChangeRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChangeRequestRepository extends MongoRepository<ChangeRequest, String> {
    // Find all CRs for a specific project
    List<ChangeRequest> findByProjectId(String projectId);
    
    // Find all CRs raised by a specific client
    List<ChangeRequest> findByRaisedByUserId(String userId);
}