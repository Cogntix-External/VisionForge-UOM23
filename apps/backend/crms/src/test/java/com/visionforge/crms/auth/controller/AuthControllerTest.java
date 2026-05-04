package com.visionforge.crms.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visionforge.crms.auth.AuthController;
import com.visionforge.crms.auth.AuthService;
import com.visionforge.crms.auth.LoginResponse;
import com.visionforge.crms.config.JwtService;
import com.visionforge.crms.security.JwtFilter;
import com.visionforge.crms.security.JwtUtil;
import com.visionforge.crms.user.CustomerUserDetailsService;
import com.visionforge.crms.user.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomerUserDetailsService userDetailsService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private JwtFilter jwtFilter;

    @Test
    void shouldLoginClient() throws Exception {
        LoginResponse response = LoginResponse.builder()
                .token("jwt-token")
                .id("client-1")
                .name("Client User")
                .email("client@test.com")
                .role(Role.CLIENT)
                .build();

        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "client@test.com",
                                "password", "Password@123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.role").value("CLIENT"));
    }

    @Test
    void shouldRegisterClient() throws Exception {
        when(authService.register(any())).thenReturn("OTP sent to your email");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Client User",
                                "email", "client@test.com",
                                "password", "Password@123",
                                "role", "CLIENT"
                        ))))
                .andExpect(status().isOk())
                .andExpect(content().string("OTP sent to your email"));
    }
}