package com.visionforge.crms.EditProfile_page.controller;

import com.visionforge.crms.EditProfile_page.dto.UpdateProfileRequest;
import com.visionforge.crms.EditProfile_page.dto.UserProfileResponse;
import com.visionforge.crms.EditProfile_page.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-profile")
@CrossOrigin(origins = "*")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        return ResponseEntity.ok(userProfileService.getProfileByEmail(email));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request
    ) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        return ResponseEntity.ok(userProfileService.updateProfile(email, request));
    }
}
