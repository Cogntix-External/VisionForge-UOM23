package com.visionforge.crms.EditProfile_page.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String username;
    private String userId;
    private String profileImage;
}
