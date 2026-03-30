package com.visionforge.crms.proposal.repository;

import com.visionforge.crms.proposal.model.Proposal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProposalRepository extends MongoRepository<Proposal, String> {

    List<Proposal> findByCompanyId(String companyId);

    List<Proposal> findByClientId(String clientId);
}