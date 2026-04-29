package com.visionforge.crms.EditProfile_page.service;

import com.visionforge.crms.EditProfile_page.dto.UpdateProfileRequest;
import com.visionforge.crms.EditProfile_page.dto.UserProfileResponse;
import com.visionforge.crms.EditProfile_page.model.UserProfile;
import com.visionforge.crms.EditProfile_page.repository.UserProfileRepository;
import com.visionforge.crms.kanban.model.KanbanTask;
import com.visionforge.crms.kanban.repository.KanbanTaskRepository;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final ProjectRepository projectRepository;
    private final KanbanTaskRepository kanbanTaskRepository;

    public UserProfileService(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            ProjectRepository projectRepository,
            KanbanTaskRepository kanbanTaskRepository
    ) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.projectRepository = projectRepository;
        this.kanbanTaskRepository = kanbanTaskRepository;
    }

    public UserProfileResponse getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        return mapToResponse(user);
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            user.setName(request.getUsername().trim());
        }

        User savedUser = userRepository.save(user);
        saveProfileMetadata(savedUser, request);

        return mapToResponse(savedUser);
    }

    private UserProfileResponse mapToResponse(User user) {
        String resolvedUserId = safeText(user.getId());
        String assignmentUserId = safeText(user.getId());
        UserProfile profile = findProfile(user);

        List<UserProfile.AssignedProject> assignedProjects =
                buildAssignedProjects(user, assignmentUserId);
        List<UserProfile.AssignedTask> assignedTasks =
                buildAssignedTasks(assignmentUserId, assignedProjects);

        return UserProfileResponse.builder()
                .id(user.getId())
                .userId(resolvedUserId)
                .username(safeText(user.getName()))
                .email(safeText(user.getEmail()))
                .role(user.getRole() == null ? "" : user.getRole().name())
                .profileImage(profile == null ? "" : safeText(profile.getProfileImage()))
                .assignedTasks(assignedTasks)
                .assignedProjects(assignedProjects)
                .build();
    }

    private UserProfile findProfile(User user) {
        String userId = safeText(user.getId());
        if (!userId.isBlank()) {
            return userProfileRepository.findByUserId(userId).orElse(null);
        }

        String email = safeText(user.getEmail());
        if (!email.isBlank()) {
            return userProfileRepository.findByEmail(email).orElse(null);
        }

        return null;
    }

    private void saveProfileMetadata(User user, UpdateProfileRequest request) {
        if (request == null || request.getProfileImage() == null) {
            return;
        }

        UserProfile profile = findProfile(user);
        if (profile == null) {
            profile = new UserProfile();
        }

        profile.setUserId(safeText(user.getId()));
        profile.setUsername(safeText(user.getName()));
        profile.setEmail(safeText(user.getEmail()));
        profile.setRole(user.getRole() == null ? "" : user.getRole().name());
        profile.setProfileImage(request.getProfileImage());

        userProfileRepository.save(profile);
    }

    private List<UserProfile.AssignedProject> buildAssignedProjects(
            User user,
            String assignmentUserId
    ) {
        Map<String, UserProfile.AssignedProject> assignedProjects = new LinkedHashMap<>();
        if (assignmentUserId.isBlank()) {
            return new ArrayList<>();
        }

        if (isClientRole(user.getRole() == null ? "" : user.getRole().name())) {
            addProjects(
                    assignedProjects,
                    projectRepository.findByClientId(assignmentUserId)
            );
        } else {
            addProjectsForAssignedTasks(assignedProjects, assignmentUserId);
        }

        return new ArrayList<>(assignedProjects.values());
    }

    private List<UserProfile.AssignedTask> buildAssignedTasks(
            String assignmentUserId,
            List<UserProfile.AssignedProject> assignedProjects
    ) {
        Map<String, UserProfile.AssignedTask> assignedTasks = new LinkedHashMap<>();
        Map<String, String> projectNameById = new LinkedHashMap<>();

        for (UserProfile.AssignedProject project : assignedProjects) {
            if (project != null && project.getPid() != null && project.getName() != null) {
                projectNameById.put(project.getPid(), project.getName());
            }
        }

        if (assignmentUserId.isBlank()) {
            return new ArrayList<>();
        }

        List<KanbanTask> tasks = kanbanTaskRepository.findByAssignedTo(assignmentUserId);
        for (KanbanTask task : tasks) {
            if (task == null || task.getId() == null) {
                continue;
            }

            String taskProjectId = task.getProjectId();
            String projectName = projectNameById.get(taskProjectId);
            if ((projectName == null || projectName.isBlank()) &&
                    taskProjectId != null &&
                    !taskProjectId.isBlank()) {
                projectRepository.findById(taskProjectId)
                        .ifPresent(project -> projectNameById.put(taskProjectId, safeText(project.getName())));
                projectName = projectNameById.get(taskProjectId);
            }

            assignedTasks.put(task.getId(), UserProfile.AssignedTask.builder()
                    .id(task.getId())
                    .title(safeText(task.getTitle()))
                    .status(safeText(task.getStatus()))
                    .projectName(safeText(projectName))
                    .build());
        }

        return new ArrayList<>(assignedTasks.values());
    }

    private void addProjects(
            Map<String, UserProfile.AssignedProject> target,
            List<Project> projects
    ) {
        for (Project project : projects) {
            if (project == null || project.getId() == null) {
                continue;
            }

            target.put(project.getId(), UserProfile.AssignedProject.builder()
                    .pid(project.getId())
                    .name(safeText(project.getName()))
                    .description(safeText(project.getDescription()))
                    .build());
        }
    }

    private void addProjectsForAssignedTasks(
            Map<String, UserProfile.AssignedProject> target,
            String assignmentUserId
    ) {
        Set<String> projectIds = new LinkedHashSet<>();

        kanbanTaskRepository.findByAssignedTo(assignmentUserId).forEach(task -> {
            if (task != null && task.getProjectId() != null && !task.getProjectId().isBlank()) {
                projectIds.add(task.getProjectId());
            }
        });

        for (String projectId : projectIds) {
            projectRepository.findById(projectId)
                    .ifPresent(project -> target.put(projectId, UserProfile.AssignedProject.builder()
                            .pid(project.getId())
                            .name(safeText(project.getName()))
                            .description(safeText(project.getDescription()))
                            .build()));
        }
    }

    private boolean isClientRole(String role) {
        String normalizedRole = role == null ? "" : role.trim().toUpperCase();
        return normalizedRole.contains("CLIENT");
    }

    private String safeText(String value) {
        return value == null || value.isBlank() ? "" : value;
    }
}
