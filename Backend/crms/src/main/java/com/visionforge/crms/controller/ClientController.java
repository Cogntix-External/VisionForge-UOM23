package com.visionforge.crms.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.visionforge.crms.model.User;
import com.visionforge.crms.service.ClientService;
import com.visionforge.crms.security.JwtUtil; // 1. Import JwtUtil

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/clients")
@CrossOrigin(origins = "*") 
public class ClientController {

    @Autowired
    private ClientService clientService;

    @Autowired
    private JwtUtil jwtUtil; // 2. Inject the Token Generator

    // 1. REGISTER Endpoint (Unchanged)
    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User newUser = clientService.registerClient(user);
            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. LOGIN Endpoint (UPDATED with JWT)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        // Authenticate the user using the service
        User user = clientService.loginClient(loginRequest.getEmail(), loginRequest.getPasswordHash());
        
        if (user != null) {
            // LOGIN SUCCESS: Generate a secure Token (Key Card)
            String token = jwtUtil.generateToken(user.getEmail());
            
            // Create a response map to send both the Token and User data
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Invalid Email or Password");
        }
    }
}