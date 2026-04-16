package com.visionforge.crms.kanban.controller;
import com.visionforge.crms.kanban.dto.CreateKanbanBoardRequest;
import com.visionforge.crms.kanban.dto.CreateTaskRequest;
import com.visionforge.crms.kanban.dto.KanbanBoardResponse;
import com.visionforge.crms.kanban.dto.KanbanBoardWithTasksResponse;
import com.visionforge.crms.kanban.dto.TaskResponse;
import com.visionforge.crms.kanban.service.KanbanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/client/projects/{projectId}/kanban")
@RequiredArgsConstructor
public class ClientKanbanController {
    
    private final KanbanService kanbanService;

    private CreateTaskRequest buildCreateTaskRequest(String title,
                                                     String description,
                                                     String assignedTo,
                                                     String dueDate,
                                                     String priority,
                                                     Integer completionPercentage,
                                                     List<String> attachments) {
        return new CreateTaskRequest(
                title,
                description,
                assignedTo == null || assignedTo.isBlank() ? null : assignedTo,
                dueDate == null || dueDate.isBlank() ? null : LocalDateTime.parse(dueDate),
                priority,
                completionPercentage,
                attachments
        );
    }
    
    @GetMapping("")
    public ResponseEntity<KanbanBoardWithTasksResponse> getKanbanBoard(
            @PathVariable String projectId,
            Authentication authentication,
            @RequestHeader(value = "X-Company-Id", required = false) String companyIdHeader) {
        String companyId = companyIdHeader;
        if (companyId == null && authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) companyId = (String) principal;
            else companyId = authentication.getName();
        }
        KanbanBoardWithTasksResponse response = kanbanService.getKanbanBoardWithTasks(projectId, companyId);
        return ResponseEntity.ok(response);
    }

    // Backwards-compatible overload used by unit tests or direct controller calls
    public ResponseEntity<KanbanBoardWithTasksResponse> getKanbanBoard(String projectId, Authentication authentication) {
        String companyId = null;
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) companyId = (String) principal;
            else companyId = authentication.getName();
        }
        KanbanBoardWithTasksResponse response = kanbanService.getKanbanBoardWithTasks(projectId, companyId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/board")
    public ResponseEntity<KanbanBoardResponse> createKanbanBoard(
            @PathVariable String projectId,
            @RequestBody CreateKanbanBoardRequest request,
            Authentication authentication,
            @RequestHeader(value = "X-Company-Id", required = false) String companyIdHeader) {
        String companyId = companyIdHeader;
        if (companyId == null && authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) companyId = (String) principal;
            else companyId = authentication.getName();
        }
        String userId = authentication != null ? authentication.getName() : "anonymous";

        KanbanBoardResponse response = kanbanService.createKanbanBoard(projectId, companyId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Backwards-compatible overload for tests/direct calls
    public ResponseEntity<KanbanBoardResponse> createKanbanBoard(String projectId, @RequestBody CreateKanbanBoardRequest request, Authentication authentication) {
        String companyId = null;
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) companyId = (String) principal;
            else companyId = authentication.getName();
        }
        String userId = authentication != null ? authentication.getName() : "anonymous";
        KanbanBoardResponse response = kanbanService.createKanbanBoard(projectId, companyId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/tasks", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable String projectId,
            @RequestParam String boardId,
            @RequestBody CreateTaskRequest request,
            Authentication authentication,
            @RequestHeader(value = "X-Company-Id", required = false) String companyIdHeader) {
        String companyId = companyIdHeader;
        if (companyId == null && authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) companyId = (String) principal;
            else companyId = authentication.getName();
        }
        String userId = authentication != null ? authentication.getName() : "anonymous";

        TaskResponse response = kanbanService.createTask(projectId, boardId, companyId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/tasks", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TaskResponse> createTaskWithAttachments(
            @PathVariable String projectId,
            @RequestParam String boardId,
            @RequestParam String title,
            @RequestParam(required = false, defaultValue = "") String description,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String dueDate,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Integer completionPercentage,
            @RequestParam(value = "attachments", required = false) List<String> attachments,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication,
            @RequestHeader(value = "X-Company-Id", required = false) String companyIdHeader) {
        CreateTaskRequest request = buildCreateTaskRequest(
                title,
                description,
                assignedTo,
                dueDate,
                priority,
                completionPercentage,
                attachments
        );
        String companyId = companyIdHeader;
        if (companyId == null && authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) companyId = (String) principal;
            else companyId = authentication.getName();
        }
        String userId = authentication != null ? authentication.getName() : "anonymous";

        TaskResponse response = kanbanService.createTask(projectId, boardId, companyId, request, userId, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Backwards-compatible overload for tests/direct calls
    public ResponseEntity<TaskResponse> createTask(String projectId, String boardId, CreateTaskRequest request, Authentication authentication) {
        String companyId = null;
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) companyId = (String) principal;
            else companyId = authentication.getName();
        }
        String userId = authentication != null ? authentication.getName() : "anonymous";
        TaskResponse response = kanbanService.createTask(projectId, boardId, companyId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/tasks")
    public ResponseEntity<List<TaskResponse>> getTasksByBoard(
            @PathVariable String projectId,
            @RequestParam String boardId) {
        List<TaskResponse> tasks = kanbanService.getTasksByBoard(boardId);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
            @PathVariable String projectId,
            @PathVariable String taskId) {
        TaskResponse response = kanbanService.getTask(taskId);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/tasks/{taskId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TaskResponse> addTaskAttachments(
            @PathVariable String projectId,
            @PathVariable String taskId,
            @RequestParam("files") List<MultipartFile> files) {
        TaskResponse response = kanbanService.addTaskAttachments(taskId, files);
        return ResponseEntity.ok(response);
    }
}
