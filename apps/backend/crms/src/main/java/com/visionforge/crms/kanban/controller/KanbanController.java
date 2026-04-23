package com.visionforge.crms.kanban.controller;

import com.visionforge.crms.kanban.dto.CreateTaskRequestDto;
import com.visionforge.crms.kanban.dto.KanbanAssigneeDto;
import com.visionforge.crms.kanban.dto.KanbanProjectDto;
import com.visionforge.crms.kanban.dto.UpdateTaskStatusDto;
import com.visionforge.crms.kanban.model.KanbanAttachment;
import com.visionforge.crms.kanban.model.KanbanBoard;
import com.visionforge.crms.kanban.model.KanbanTask;
import com.visionforge.crms.kanban.service.KanbanService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/company/kanban")
@CrossOrigin(origins = "http://localhost:3000")
public class KanbanController {

    private final KanbanService kanbanService;

    public KanbanController(KanbanService kanbanService) {
        this.kanbanService = kanbanService;
    }

    @GetMapping("/assignees")
    public ResponseEntity<List<KanbanAssigneeDto>> getCompanyAssignees() {
        return ResponseEntity.ok(kanbanService.getCompanyAssignees());
    }

    @GetMapping("/assigned-projects")
    public ResponseEntity<List<KanbanProjectDto>> getAssignedProjects() {
        return ResponseEntity.ok(kanbanService.getAssignedProjectsForCurrentUser());
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<KanbanBoard> getBoard(@PathVariable String projectId) {
        return ResponseEntity.ok(kanbanService.getBoardByProjectId(projectId));
    }

    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<KanbanTask>> getTasks(@PathVariable String projectId) {
        return ResponseEntity.ok(kanbanService.getTasksByProjectId(projectId));
    }

    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<KanbanTask> createTask(@PathVariable String projectId,
                                                 @RequestBody CreateTaskRequestDto dto) {
        return ResponseEntity.ok(kanbanService.createTask(projectId, dto));
    }

    @PutMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<KanbanTask> updateTask(@PathVariable String projectId,
                                                 @PathVariable String taskId,
                                                 @RequestBody CreateTaskRequestDto dto) {
        return ResponseEntity.ok(kanbanService.updateTask(projectId, taskId, dto));
    }

    @PostMapping(value = "/{projectId}/tasks/{taskId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<KanbanTask> uploadTaskAttachments(@PathVariable String projectId,
                                                            @PathVariable String taskId,
                                                            @RequestParam("files") MultipartFile[] files) throws IOException {
        return ResponseEntity.ok(kanbanService.uploadAttachments(projectId, taskId, files));
    }

    @PostMapping("/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<KanbanTask> addTaskComment(@PathVariable String projectId,
                                                     @PathVariable String taskId,
                                                     @RequestParam("comment") String comment) {
        return ResponseEntity.ok(kanbanService.addComment(projectId, taskId, comment));
    }

    @GetMapping("/{projectId}/tasks/{taskId}/attachments/{attachmentId}")
    public ResponseEntity<Resource> downloadTaskAttachment(@PathVariable String projectId,
                                                           @PathVariable String taskId,
                                                           @PathVariable String attachmentId) throws IOException {
        KanbanAttachment attachment = kanbanService.getAttachmentMetadata(projectId, taskId, attachmentId);
        Resource resource = kanbanService.getAttachmentResource(projectId, taskId, attachment);

        MediaType mediaType = resolveAttachmentMediaType(attachment.getContentType());
        ResponseEntity.BodyBuilder response = ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resolveAttachmentFileName(attachment) + "\"");

        long contentLength = attachment.getSize() > 0 ? attachment.getSize() : resource.contentLength();
        if (contentLength > 0) {
            response.contentLength(contentLength);
        }

        return response.body(resource);
    }

    @DeleteMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable String projectId,
                                           @PathVariable String taskId) {
        kanbanService.deleteTask(projectId, taskId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/tasks/{taskId}/status")
    public ResponseEntity<KanbanTask> updateTaskStatus(@PathVariable String taskId,
                                                       @RequestBody UpdateTaskStatusDto dto) {
        return ResponseEntity.ok(kanbanService.updateTaskStatus(taskId, dto));
    }

    private MediaType resolveAttachmentMediaType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        try {
            return MediaType.parseMediaType(contentType);
        } catch (InvalidMediaTypeException ignored) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private String resolveAttachmentFileName(KanbanAttachment attachment) {
        String fileName = attachment.getFileName();
        if (fileName == null || fileName.isBlank()) {
            return "attachment";
        }

        return fileName.replace("\"", "");
    }
}