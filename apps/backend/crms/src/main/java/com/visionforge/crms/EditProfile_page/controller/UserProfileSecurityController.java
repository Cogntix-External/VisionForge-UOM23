package com.visionforge.crms.EditProfile_page.controller;

import com.visionforge.crms.EditProfile_page.dto.ChangePasswordRequest;
import com.visionforge.crms.EditProfile_page.service.UserProfileSecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserProfileSecurityController {

    private final UserProfileSecurityService userProfileSecurityService;

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request
    ) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        try {
            String message = userProfileSecurityService.changePassword(authentication.getName(), request);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("message", e.getReason() != null ? e.getReason() : "Failed to change password"));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", "Failed to change password"));
        }
    }
}
