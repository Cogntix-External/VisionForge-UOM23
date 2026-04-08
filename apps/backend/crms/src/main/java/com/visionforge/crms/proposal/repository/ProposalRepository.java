package com.visionforge.crms.proposal.repository;

import com.visionforge.crms.proposal.model.Proposal;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProposalRepository extends MongoRepository<Proposal, String> {
    List<Proposal> findByClientId(String clientId);
    List<Proposal> findByCompanyId(String companyId);
    Optional<Proposal> findByIdAndClientId(String id, String clientId);
}