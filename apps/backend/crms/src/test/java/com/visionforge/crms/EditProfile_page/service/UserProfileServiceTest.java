package com.visionforge.crms.EditProfile_page.service;

import com.visionforge.crms.EditProfile_page.dto.UpdateProfileRequest;
import com.visionforge.crms.EditProfile_page.dto.UserProfileResponse;
import com.visionforge.crms.EditProfile_page.model.UserProfile;
import com.visionforge.crms.EditProfile_page.repository.UserProfileRepository;
import com.visionforge.crms.kanban.model.KanbanTask;
import com.visionforge.crms.kanban.repository.KanbanTaskRepository;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.user.Role;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Profile Service Tests")
class UserProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private KanbanTaskRepository kanbanTaskRepository;

    @InjectMocks
    private UserProfileService userProfileService;

    private User clientUser;
    private User companyUser;

    @BeforeEach
    void setUp() {
        clientUser = User.builder()
                .id("client-1")
                .name("Client User")
                .email("client@example.com")
                .role(Role.CLIENT)
                .build();

        companyUser = User.builder()
                .id("company-1")
                .name("Old Company Name")
                .email("company@example.com")
                .role(Role.COMPANY)
                .build();
    }

    @Test
    @DisplayName("Get profile by email creates profile and includes client projects")
    void getProfileByEmail_CreatesProfileAndIncludesClientProjects() {
        Project project = Project.builder()
                .id("project-1")
                .name("Client Portal")
                .description("Portal build")
                .clientId("client-1")
                .build();
        UserProfile createdProfile = UserProfile.builder()
                .userId("client-1")
                .email("client@example.com")
                .username("Client User")
                .role("CLIENT")
                .build();
        AtomicInteger findProfileCalls = new AtomicInteger();

        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(clientUser));
        when(userProfileRepository.findByUserId("client-1"))
                .thenAnswer(invocation -> findProfileCalls.getAndIncrement() == 0
                        ? Optional.empty()
                        : Optional.of(createdProfile));
        when(projectRepository.findByClientId("client-1")).thenReturn(List.of(project));
        when(kanbanTaskRepository.findByAssignedTo("client-1")).thenReturn(Collections.emptyList());
        when(userProfileRepository.save(any(UserProfile.class)))
                .thenAnswer(invocation -> (UserProfile) invocation.getArgument(0));

        UserProfileResponse response = userProfileService.getProfileByEmail("client@example.com");

        assertEquals("client-1", response.getUserId());
        assertEquals("Client User", response.getUsername());
        assertEquals("CLIENT", response.getRole());
        assertEquals("", response.getProfileImage());
        assertEquals(1, response.getAssignedProjects().size());
        assertEquals("Client Portal", response.getAssignedProjects().get(0).getName());
        assertTrue(response.getAssignedTasks().isEmpty());

        ArgumentCaptor<UserProfile> profileCaptor = ArgumentCaptor.forClass(UserProfile.class);
        verify(userProfileRepository).save(profileCaptor.capture());
        assertEquals("client-1", profileCaptor.getValue().getUserId());
        assertEquals("client@example.com", profileCaptor.getValue().getEmail());
    }

    @Test
    @DisplayName("Update profile trims username, stores profile image, and maps assigned tasks")
    void updateProfile_UpdatesUserAndMapsAssignments() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("  New Company Name  ");
        request.setProfileImage("avatar.png");

        UserProfile existingProfile = UserProfile.builder()
                .id("profile-1")
                .userId("company-1")
                .email("company@example.com")
                .profileImage("old.png")
                .build();

        KanbanTask assignedTask = KanbanTask.builder()
                .id("task-1")
                .projectId("project-2")
                .title("Build API")
                .status("IN_PROGRESS")
                .assignedTo("company-1")
                .build();

        Project project = Project.builder()
                .id("project-2")
                .name("Internal CRM")
                .description("Company work")
                .build();

        when(userRepository.findByEmail("company@example.com")).thenReturn(Optional.of(companyUser));
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> (User) invocation.getArgument(0));
        when(userProfileRepository.findByUserId("company-1")).thenReturn(Optional.of(existingProfile));
        when(userProfileRepository.save(any(UserProfile.class)))
                .thenAnswer(invocation -> (UserProfile) invocation.getArgument(0));
        when(kanbanTaskRepository.findByAssignedTo("company-1")).thenReturn(List.of(assignedTask));
        when(projectRepository.findById("project-2")).thenReturn(Optional.of(project));

        UserProfileResponse response = userProfileService.updateProfile("company@example.com", request);

        assertEquals("New Company Name", response.getUsername());
        assertEquals("avatar.png", response.getProfileImage());
        assertEquals(1, response.getAssignedProjects().size());
        assertEquals("Internal CRM", response.getAssignedProjects().get(0).getName());
        assertEquals(1, response.getAssignedTasks().size());
        assertEquals("Build API", response.getAssignedTasks().get(0).getTitle());
        assertEquals("Internal CRM", response.getAssignedTasks().get(0).getProjectName());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("New Company Name", userCaptor.getValue().getName());

        ArgumentCaptor<UserProfile> profileCaptor = ArgumentCaptor.forClass(UserProfile.class);
        verify(userProfileRepository).save(profileCaptor.capture());
        assertEquals("avatar.png", profileCaptor.getValue().getProfileImage());
        assertEquals("New Company Name", profileCaptor.getValue().getUsername());
    }

    @Test
    @DisplayName("Get profile by email throws when user does not exist")
    void getProfileByEmail_WhenUserMissing_ThrowsException() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userProfileService.getProfileByEmail("missing@example.com")
        );

        assertTrue(exception.getMessage().contains("Profile not found"));
    }
}