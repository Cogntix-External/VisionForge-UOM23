package com.visionforge.crms.auth.dto;

import lombok.Data;

@Data
public class GoogleTokenRequest {
    private String idToken;
    private String role; // "CLIENT" or "COMPANY", optional
}
