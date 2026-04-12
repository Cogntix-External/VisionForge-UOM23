package com.visionforge.crms.changerequest.repository;

import com.visionforge.crms.changerequest.model.ChangeRequest;
import com.visionforge.crms.changerequest.model.ChangeRequestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ChangeRequestRepository extends MongoRepository<ChangeRequest, String> {
    List<ChangeRequest> findByClientId(String clientId);
    List<ChangeRequest> findByCompanyId(String companyId);
    List<ChangeRequest> findByClientIdAndProjectId(String clientId, String projectId);
    List<ChangeRequest> findByCompanyIdAndProjectId(String companyId, String projectId);
    List<ChangeRequest> findByCompanyIdAndProjectIdAndPrdId(String companyId, String projectId, String prdId);
    List<ChangeRequest> findByProjectIdAndStatus(String projectId, ChangeRequestStatus status);
    List<ChangeRequest> findByProjectIdAndPrdIdAndStatus(String projectId, String prdId, ChangeRequestStatus status);
    Optional<ChangeRequest> findByIdAndClientId(String id, String clientId);
    Optional<ChangeRequest> findByIdAndCompanyId(String id, String companyId);
}