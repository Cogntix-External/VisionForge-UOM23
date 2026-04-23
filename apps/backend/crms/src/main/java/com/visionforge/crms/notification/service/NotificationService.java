package com.visionforge.crms.notification.service;

import com.visionforge.crms.notification.dto.NotificationResponse;
import com.visionforge.crms.notification.model.Notification;
import com.visionforge.crms.notification.model.NotificationType;
import com.visionforge.crms.notification.repository.NotificationRepository;
import com.visionforge.crms.user.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    public void createNotification(
            String userId,
            String title,
            String message,
            NotificationType type,
            String relatedEntityId,
            String relatedEntityType
    ) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .relatedEntityId(relatedEntityId)
                .relatedEntityType(relatedEntityType)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getCurrentUserNotifications() {
        String userId = currentUserService.getCurrentUserId();

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public long getCurrentUserUnreadCount() {
        String userId = currentUserService.getCurrentUserId();
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .relatedEntityId(n.getRelatedEntityId())
                .relatedEntityType(n.getRelatedEntityType())
                .createdAt(n.getCreatedAt())
                .build();
    }
}