package com.visionforge.crms.controller;

import com.visionforge.crms.model.User;
import com.visionforge.crms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/clients") // Matches your API Spec [cite: 512]
@CrossOrigin(origins = "http://localhost:3000") // Allows your React Frontend to talk to this
public class ClientController {

    @Autowired
    private UserRepository userRepository;

    // Test Endpoint: Get all users
    @GetMapping
    public List<User> getAllClients() {
        return userRepository.findAll();
    }

    // Test Endpoint: Add a fake client (Just to test database connection)
    @PostMapping("/test-add")
    public User createTestClient(@RequestBody User user) {
        return userRepository.save(user);
    }
}