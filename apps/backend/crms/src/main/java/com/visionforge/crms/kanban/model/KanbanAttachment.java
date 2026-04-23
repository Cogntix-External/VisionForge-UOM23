package com.visionforge.crms.kanban.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
public class KanbanAttachment {

    private String fileId;
    private String fileName;
    private String contentType;
    private long size;
    private Instant uploadedAt;

    public KanbanAttachment(String fileId, String fileName, String contentType, long size, Instant uploadedAt) {
        this.fileId = fileId;
        this.fileName = fileName;
        this.contentType = contentType;
        this.size = size;
        this.uploadedAt = uploadedAt;
    }
}
