package com.visionforge.crms.EditProfile_page.repository;

import com.visionforge.crms.EditProfile_page.model.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserProfileRepository extends MongoRepository<UserProfile, String> {
    Optional<UserProfile> findByEmail(String email);
    Optional<UserProfile> findByUserId(String userId);
}
