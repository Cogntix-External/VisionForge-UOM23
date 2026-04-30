package com.visionforge.crms.notification.notification;

import com.visionforge.crms.notification.dto.NotificationResponse;
import com.visionforge.crms.notification.model.Notification;
import com.visionforge.crms.notification.model.NotificationType;
import com.visionforge.crms.notification.repository.NotificationRepository;
import com.visionforge.crms.notification.service.NotificationService;
import com.visionforge.crms.user.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Notification Service Tests")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private NotificationService notificationService;

    private Notification notification;

    @BeforeEach
    void setUp() {
        notification = Notification.builder()
                .id("notif001")
                .userId("company001")
                .title("Proposal Accepted")
                .message("Your proposal has been accepted.")
                .type(NotificationType.PROPOSAL_ACCEPTED)
                .read(false)
                .relatedEntityId("proposal001")
                .relatedEntityType("PROPOSAL")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Create notification - Saves notification")
    void createNotification_SavesNotification() {
        when(notificationRepository.save(any(Notification.class)))
                .thenReturn(notification);

        notificationService.createNotification(
                "company001",
                "Proposal Accepted",
                "Your proposal has been accepted.",
                NotificationType.PROPOSAL_ACCEPTED,
                "proposal001",
                "PROPOSAL");

        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Get current user notifications - Returns mapped list")
    void getCurrentUserNotifications_ReturnsList() {
        when(currentUserService.getCurrentUserId()).thenReturn("company001");
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("company001"))
                .thenReturn(List.of(notification));

        List<NotificationResponse> responses = notificationService
                .getCurrentUserNotifications();

        assertEquals(1, responses.size());
        assertEquals("notif001", responses.get(0).getId());
        assertEquals("Proposal Accepted", responses.get(0).getTitle());
        assertEquals(NotificationType.PROPOSAL_ACCEPTED, responses.get(0).getType());
        assertFalse(responses.get(0).isRead());
        assertEquals("proposal001", responses.get(0).getRelatedEntityId());
    }

    @Test
    @DisplayName("Get current user unread count - Returns repository count")
    void getCurrentUserUnreadCount_ReturnsCorrectCount() {
        when(currentUserService.getCurrentUserId()).thenReturn("company001");
        when(notificationRepository.countByUserIdAndReadFalse("company001"))
                .thenReturn(3L);

        long count = notificationService.getCurrentUserUnreadCount();

        assertEquals(3L, count);
    }

    @Test
    @DisplayName("Mark as read - Updates notification")
    void markAsRead_UpdatesNotification() {
        when(notificationRepository.findById("notif001"))
                .thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class)))
                .thenReturn(notification);

        notificationService.markAsRead("notif001");

        assertTrue(notification.isRead());
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    @DisplayName("Mark as read - Not found throws exception")
    void markAsRead_NotFound_ThrowsException() {
        when(notificationRepository.findById("invalid"))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> notificationService.markAsRead("invalid"));

        assertTrue(ex.getMessage().contains("Notification not found"));
        verify(notificationRepository, never()).save(any());
    }
}
