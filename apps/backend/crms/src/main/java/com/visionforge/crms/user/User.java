package com.visionforge.crms.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private String password;
    private Role role;

    //  OTP verification fields
    private String otp;
    private boolean emailVerified;

    //  Forgot Password fields
    private String resetToken;
    private LocalDateTime resetTokenExpiry;
}