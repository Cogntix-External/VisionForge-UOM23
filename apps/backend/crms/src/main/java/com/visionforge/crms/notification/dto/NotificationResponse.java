package com.visionforge.crms.notification.dto;

import com.visionforge.crms.notification.model.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean read;
    private String relatedEntityId;
    private String relatedEntityType;
    private LocalDateTime createdAt;
}