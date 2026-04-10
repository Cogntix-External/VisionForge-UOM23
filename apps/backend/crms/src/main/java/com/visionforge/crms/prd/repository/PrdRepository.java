package com.visionforge.crms.prd.repository;

import com.visionforge.crms.prd.model.Prd;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrdRepository extends MongoRepository<Prd, String> {
    Optional<Prd> findTopByOrderByCreatedAtDesc();
}
