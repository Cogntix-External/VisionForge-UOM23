package com.visionforge.crms.EditProfile_page.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_profiles")
public class UserProfile {

    @Id
    private String id;

    private String userId;

    @Field("name")
    private String username;

    private String email;
    private String role;
    private String profileImage;

    private List<AssignedTask> assignedTasks;
    private List<AssignedProject> assignedProjects;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignedTask {
        private String id;
        private String title;
        private String status;
        private String projectName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignedProject {
        private String pid;
        private String name;
        private String description;
    }
}
