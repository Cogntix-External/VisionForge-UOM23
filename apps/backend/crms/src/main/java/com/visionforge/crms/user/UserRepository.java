package com.visionforge.crms.user;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository("authUserRepository")
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    // 🔐 Forgot password use
    Optional<User> findByResetToken(String resetToken);
}