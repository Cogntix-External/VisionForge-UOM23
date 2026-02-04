package com.visionforge.crms.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.visionforge.crms.model.User;
import com.visionforge.crms.repository.UserRepository;

@Service
public class ClientService {

    @Autowired
    private UserRepository userRepository;

    // Feature: Register a new Client
    public User registerClient(User user) {
        // 1. Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already taken!");
        }
        // 2. Set default role (if missing)
        if (user.getRole() == null) {
            user.setRole("CLIENT");
        }
        // 3. Save to database
        return userRepository.save(user);
    }

    // Feature: Login (Check email and password)
    public User loginClient(String email, String password) {
        // 1. Find user by email
        Optional<User> foundUser = userRepository.findByEmail(email);

        // 2. Check if user exists AND if password matches
        if (foundUser.isPresent() && foundUser.get().getPasswordHash().equals(password)) {
            return foundUser.get(); // Login Success! Return the user.
        } else {
            return null; // Login Failed
        }
    }
}