package com.visionforge.crms.auth;

import com.visionforge.crms.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String id;
    private String name;
    private String email;
    private Role role;
}