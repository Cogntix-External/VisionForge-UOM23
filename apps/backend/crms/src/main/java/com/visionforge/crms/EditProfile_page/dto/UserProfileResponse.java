package com.visionforge.crms.EditProfile_page.dto;

import com.visionforge.crms.EditProfile_page.model.UserProfile;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserProfileResponse {

    private String id;
    private String userId;
    private String username;
    private String email;
    private String role;
    private String profileImage;

    private List<UserProfile.AssignedTask> assignedTasks;
    private List<UserProfile.AssignedProject> assignedProjects;
}
