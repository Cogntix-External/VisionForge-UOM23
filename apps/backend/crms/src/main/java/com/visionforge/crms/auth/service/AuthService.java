package com.visionforge.crms.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.visionforge.crms.auth.config.JwtService;
import com.visionforge.crms.auth.dto.*;
import com.visionforge.crms.user.Role;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${google.client-id:}")
    private String googleClientId;

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    // REGISTER → REAL OTP SEND
    public String register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        if (email.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        // Block disposable / temporary emails
        if (email.endsWith("@tempmail.com")
                || email.endsWith("@mailinator.com")
                || email.endsWith("@10minutemail.com")
                || email.endsWith("@guerrillamail.com")
                || email.endsWith("@yopmail.com")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Temporary emails are not allowed");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);

        Role role;
        try {
            role = Role.valueOf(
                    request.getRole() != null ? request.getRole().trim().toUpperCase() : "CLIENT");
        } catch (Exception e) {
            role = Role.CLIENT;
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .otp(otp)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        // REAL OTP SEND
        emailService.sendOtp(email, otp);

        return "OTP sent to your email";
    }

    // VERIFY OTP
    public LoginResponse verifyOtp(String email, String otp) {
        String normalizedEmail = normalizeEmail(email);

        if (normalizedEmail.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (otp == null || otp.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP is required");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        user.setEmailVerified(true);
        user.setOtp(null);

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // LOGIN → ONLY VERIFIED USERS
    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please verify your email first");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()));

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // FORGOT PASSWORD
    public String forgotPassword(String email) {
        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with this email"));

        String resetToken = UUID.randomUUID().toString();

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

        userRepository.save(user);

        return "Password reset token generated successfully";
    }

    // RESET PASSWORD
    public String resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reset token"));

        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        return "Password reset successful";
    }

    public java.util.Map<String, Object> loginWithGoogle(String idTokenString, String roleStr) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid ID token.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = normalizeEmail(payload.getEmail());
            String googleName = (String) payload.get("name");
            String googleSubjectId = payload.getSubject();

            // Check if user already exists
            java.util.Optional<User> existingUser = userRepository.findByEmail(email);

            if (existingUser.isPresent()) {
                // ── EXISTING USER → direct login, no role prompt ──────────────
                User user = existingUser.get();
                // Link googleId if not already linked
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleSubjectId);
                    user.setEmailVerified(true);
                    userRepository.save(user);
                }
                String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
                java.util.Map<String, Object> res = new java.util.LinkedHashMap<>();
                res.put("newUser", false);
                res.put("token", token);
                res.put("id", user.getId());
                res.put("name", user.getName());
                res.put("email", user.getEmail());
                res.put("role", user.getRole());
                return res;

            } else {
                // ── NEW USER ──────────────────────────────────────────────────
                if (roleStr == null || roleStr.trim().isEmpty()) {
                    // Role not provided yet → tell frontend to show role picker
                    java.util.Map<String, Object> res = new java.util.LinkedHashMap<>();
                    res.put("newUser", true);
                    res.put("googleEmail", email);
                    res.put("googleName", googleName != null ? googleName : email.split("@")[0]);
                    return res;
                }

                // Role provided → create user
                Role role;
                try {
                    role = Role.valueOf(roleStr.trim().toUpperCase());
                } catch (Exception e) {
                    role = Role.CLIENT;
                }

                User newUser = User.builder()
                        .email(email)
                        .name(googleName != null ? googleName : email.split("@")[0])
                        .role(role)
                        .emailVerified(true)
                        .googleId(googleSubjectId)
                        .build();
                userRepository.save(newUser);

                String token = jwtService.generateToken(newUser.getEmail(), newUser.getRole().name());
                java.util.Map<String, Object> res = new java.util.LinkedHashMap<>();
                res.put("newUser", false);
                res.put("token", token);
                res.put("id", newUser.getId());
                res.put("name", newUser.getName());
                res.put("email", newUser.getEmail());
                res.put("role", newUser.getRole());
                return res;
            }

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google authentication failed: " + e.getMessage(), e);
        }
    }
}