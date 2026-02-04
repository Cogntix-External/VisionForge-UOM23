package com.visionforge.crms.repository;

import com.visionforge.crms.model.Prd;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PrdRepository extends MongoRepository<Prd, String> {
    List<Prd> findByProjectId(String projectId);
}
