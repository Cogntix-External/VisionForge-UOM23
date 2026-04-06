package com.visionforge.crms.project.repository;

import com.visionforge.crms.project.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {

    List<Project> findByCompanyId(String companyId);

    Optional<Project> findByProposalId(String proposalId);
}