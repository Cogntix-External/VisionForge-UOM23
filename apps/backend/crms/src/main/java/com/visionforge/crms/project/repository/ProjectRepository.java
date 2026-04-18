package com.visionforge.crms.project.repository;

import com.visionforge.crms.project.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {

    // 🔹 Client side - current client projects
    List<Project> findByClientId(String clientId);

    // 🔹 Company side - company projects
    List<Project> findByCompanyId(String companyId);

    // 🔹 Proposal -> Project mapping
    Optional<Project> findByProposalId(String proposalId);

    // 🔹 Secure fetch (important 🔥)
    Optional<Project> findByIdAndClientId(String id, String clientId);
    Optional<Project> findByIdAndCompanyId(String id, String companyId);

    // 🔹 OPTIONAL (future use)
    List<Project> findByStatus(Project.ProjectStatus status);
}