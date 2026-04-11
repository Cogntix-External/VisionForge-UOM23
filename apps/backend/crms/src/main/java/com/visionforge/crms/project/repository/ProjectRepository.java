package com.visionforge.crms.project.repository;

import com.visionforge.crms.project.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {

    // 🔹 Client side
    List<Project> findByClientId(String clientId);

    // 🔹 Company side
    List<Project> findByCompanyId(String companyId);

    // 🔹 Link project with proposal
    Optional<Project> findByProposalId(String proposalId);
}