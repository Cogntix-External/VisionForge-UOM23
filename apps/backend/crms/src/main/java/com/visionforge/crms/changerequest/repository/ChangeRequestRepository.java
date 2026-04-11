package com.visionforge.crms.changerequest.repository;

import com.visionforge.crms.changerequest.model.ChangeRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ChangeRequestRepository extends MongoRepository<ChangeRequest, String> {
    List<ChangeRequest> findByClientId(String clientId);
    List<ChangeRequest> findByCompanyId(String companyId);
    Optional<ChangeRequest> findByIdAndClientId(String id, String clientId);
    Optional<ChangeRequest> findByIdAndCompanyId(String id, String companyId);
    
}