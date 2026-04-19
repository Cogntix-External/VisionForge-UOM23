package com.visionforge.crms.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user") 
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    // CURRENT USER API
    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "name", user.getName()
        );
    }

    // (optional) keep your old endpoint
    @GetMapping("/welcome")
    public String clientWelcome() {
        return "Welcome Client Portal";
    }
}