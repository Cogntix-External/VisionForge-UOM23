package com.visionforge.crms.repository;

import com.visionforge.crms.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    // Custom method to find a user by email (useful for Login!) [cite: 512]
    // Spring Boot automatically understands this method name and writes the query for you.
    Optional<User> findByEmail(String email);
}