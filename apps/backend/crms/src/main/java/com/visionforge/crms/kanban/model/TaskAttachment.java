package com.visionforge.crms.kanban.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "kanban_task_attachments")
public class TaskAttachment {

    @Id
    private String id;

    @Field("task_id")
    private String taskId;

    @Field("file_name")
    private String fileName;

    @Field("content_type")
    private String contentType;

    @Field("size")
    private long size;

    @Field("data")
    private byte[] data;

    @Field("uploaded_at")
    private LocalDateTime uploadedAt;

    public TaskAttachment(String taskId, String fileName, String contentType, long size, byte[] data) {
        this.taskId = taskId;
        this.fileName = fileName;
        this.contentType = contentType;
        this.size = size;
        this.data = data;
        this.uploadedAt = LocalDateTime.now();
    }
}
