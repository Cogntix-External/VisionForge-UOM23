package com.visionforge.crms.controller;

import com.visionforge.crms.model.User;
import com.visionforge.crms.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/clients")
@CrossOrigin(origins = "*") // Critical for connecting to Frontend later
public class ClientController {

    @Autowired
    private ClientService clientService;

    // 1. REGISTER Endpoint (POST /api/v1/clients/signup)
    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User newUser = clientService.registerClient(user);
            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. LOGIN Endpoint (POST /api/v1/clients/login)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        // We expect the frontend to send a User object with email & passwordHash
        User user = clientService.loginClient(loginRequest.getEmail(), loginRequest.getPasswordHash());
        
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(401).body("Invalid Email or Password");
        }
    }
}