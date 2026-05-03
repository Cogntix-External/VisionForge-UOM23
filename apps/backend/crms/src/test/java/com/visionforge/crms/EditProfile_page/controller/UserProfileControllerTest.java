package com.visionforge.crms.EditProfile_page.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visionforge.crms.EditProfile_page.dto.UpdateProfileRequest;
import com.visionforge.crms.EditProfile_page.dto.UserProfileResponse;
import com.visionforge.crms.EditProfile_page.service.UserProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Profile Controller Tests")
class UserProfileControllerTest {

    @Mock
    private UserProfileService userProfileService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private UserProfileResponse response;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = standaloneSetup(new UserProfileController(userProfileService))
                .setMessageConverters(new JacksonJsonHttpMessageConverter())
                .build();

        response = UserProfileResponse.builder()
                .id("profile-1")
                .userId("user-1")
                .username("Test User")
                .email("user@example.com")
                .role("COMPANY")
                .profileImage("avatar.png")
                .build();
    }

    @Test
    @DisplayName("GET /api/user-profile/me returns unauthorized without authentication")
    void getMyProfile_WithoutAuthentication_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/user-profile/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/user-profile/me returns current profile")
    void getMyProfile_WithAuthentication_ReturnsProfile() throws Exception {
        when(userProfileService.getProfileByEmail("user@example.com")).thenReturn(response);

        mockMvc.perform(get("/api/user-profile/me")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user-1"))
                .andExpect(jsonPath("$.username").value("Test User"))
                .andExpect(jsonPath("$.profileImage").value("avatar.png"));

        verify(userProfileService).getProfileByEmail("user@example.com");
    }

    @Test
    @DisplayName("PUT /api/user-profile/me updates current profile")
    void updateMyProfile_WithAuthentication_ReturnsUpdatedProfile() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("Updated User");
        request.setProfileImage("new-avatar.png");

        UserProfileResponse updatedResponse = UserProfileResponse.builder()
                .id("profile-1")
                .userId("user-1")
                .username("Updated User")
                .email("user@example.com")
                .role("COMPANY")
                .profileImage("new-avatar.png")
                .build();

        when(userProfileService.updateProfile(eq("user@example.com"), any(UpdateProfileRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/user-profile/me")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("Updated User"))
                .andExpect(jsonPath("$.profileImage").value("new-avatar.png"));

        verify(userProfileService).updateProfile(eq("user@example.com"), any(UpdateProfileRequest.class));
    }
}
