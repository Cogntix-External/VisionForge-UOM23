package com.visionforge.crms.auth.service;

import com.visionforge.crms.auth.EmailService;
import com.visionforge.crms.auth.LoginResponse;
import com.visionforge.crms.auth.AuthService;
import com.visionforge.crms.auth.LoginRequest;
import com.visionforge.crms.config.JwtService;
import com.visionforge.crms.user.Role;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldLoginClient() {
        User user = User.builder()
                .id("client-1")
                .name("Client User")
                .email("client@test.com")
                .password("encoded-password")
                .role(Role.CLIENT)
                .emailVerified(true)
                .build();

        LoginRequest request = new LoginRequest();
        request.setEmail("client@test.com");
        request.setPassword("Password@123");
        lenient().when(jwtService.generateToken(anyString(), anyString())).thenReturn("jwt-token");
        when(userRepository.findByEmail("client@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password@123", "encoded-password")).thenReturn(true);


        LoginResponse result = authService.login(request);

        assertEquals("jwt-token", result.getToken());
        assertEquals("client@test.com", result.getEmail());
        assertEquals(Role.CLIENT, result.getRole());
    }
}