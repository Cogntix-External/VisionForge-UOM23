package com.visionforge.crms.kanban.controller;
import com.visionforge.crms.kanban.dto.*;
import com.visionforge.crms.kanban.model.TaskStatus;
import com.visionforge.crms.kanban.service.KanbanService;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.kanban.service.KanbanStatisticsDTO;
import com.visionforge.crms.user.CurrentUserService;
import com.visionforge.crms.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/company/projects/{projectId}/kanban")
@RequiredArgsConstructor
public class KanbanController {
    
    private final KanbanService kanbanService;
    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUserService;

    private void ensureCompanyUser() {
        if (currentUserService.getCurrentUserRole() != Role.COMPANY) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Company access required");
        }
    }

    private String resolveProjectCompanyId(String projectId, String fallbackCompanyId) {
        return projectRepository.findById(projectId)
                .map(Project::getCompanyId)
                .filter(companyId -> companyId != null && !companyId.isBlank())
                .orElse(fallbackCompanyId);
    }

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
    
    // ==================== BOARD OPERATIONS ====================
    
    @PostMapping("/board")
    public ResponseEntity<KanbanBoardResponse> createKanbanBoard(
            @PathVariable String projectId,
            @RequestBody CreateKanbanBoardRequest request,
            Authentication authentication,
            @RequestHeader(value = "X-Company-Id", required = false) String companyIdHeader) {
        ensureCompanyUser();
        String companyId = companyIdHeader;
        if (companyId == null && authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) companyId = (String) principal;
            else companyId = authentication.getName();
        }
        companyId = resolveProjectCompanyId(projectId, companyId);
        String userId = authentication != null ? authentication.getName() : "anonymous";
        
        KanbanBoardResponse response = kanbanService.createKanbanBoard(projectId, companyId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("")
    public ResponseEntity<KanbanBoardWithTasksResponse> getKanbanBoard(
            @PathVariable String projectId,
            Authentication authentication,
            @RequestHeader(value = "X-Company-Id", required = false) String companyIdHeader) {
        ensureCompanyUser();
        String companyId = companyIdHeader;
        if (companyId == null && authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) companyId = (String) principal;
            else companyId = authentication.getName();
        }
        companyId = resolveProjectCompanyId(projectId, companyId);

        KanbanBoardWithTasksResponse response = kanbanService.getKanbanBoardWithTasks(projectId, companyId);
        return ResponseEntity.ok(response);
    }
    
    // ==================== TASK OPERATIONS ====================
    
    @PostMapping(value = "/tasks", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable String projectId,
            @RequestParam String boardId,
            @RequestBody CreateTaskRequest request,
            Authentication authentication,
            @RequestHeader(value = "X-Company-Id", required = false) String companyIdHeader) {
        ensureCompanyUser();
        String companyId = companyIdHeader;
        if (companyId == null && authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) companyId = (String) principal;
            else companyId = authentication.getName();
        }
        companyId = resolveProjectCompanyId(projectId, companyId);
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
        ensureCompanyUser();
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
        companyId = resolveProjectCompanyId(projectId, companyId);
        String userId = authentication != null ? authentication.getName() : "anonymous";

        TaskResponse response = kanbanService.createTask(projectId, boardId, companyId, request, userId, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/tasks")
    public ResponseEntity<List<TaskResponse>> getTasksByBoard(
            @PathVariable String projectId,
            @RequestParam String boardId) {
        ensureCompanyUser();
        List<TaskResponse> tasks = kanbanService.getTasksByBoard(boardId);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/tasks/status/{status}")
    public ResponseEntity<List<TaskResponse>> getTasksByStatus(
            @PathVariable String projectId,
            @RequestParam String boardId,
            @PathVariable TaskStatus status) {
        ensureCompanyUser();
        List<TaskResponse> tasks = kanbanService.getTasksByStatus(boardId, status);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
            @PathVariable String projectId,
            @PathVariable String taskId) {
        ensureCompanyUser();
        TaskResponse response = kanbanService.getTask(taskId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/tasks/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable String projectId,
            @PathVariable String taskId,
            @RequestBody UpdateTaskStatusRequest request) {
        ensureCompanyUser();
        TaskResponse response = kanbanService.updateTaskStatus(taskId, request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping(value = "/tasks/{taskId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable String projectId,
            @PathVariable String taskId,
            @RequestBody CreateTaskRequest request) {
        ensureCompanyUser();
        TaskResponse response = kanbanService.updateTask(taskId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/tasks/{taskId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TaskResponse> updateTaskWithAttachments(
            @PathVariable String projectId,
            @PathVariable String taskId,
            @RequestParam String title,
            @RequestParam(required = false, defaultValue = "") String description,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String dueDate,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Integer completionPercentage,
            @RequestParam(value = "attachments", required = false) List<String> attachments,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        ensureCompanyUser();
        CreateTaskRequest request = buildCreateTaskRequest(
                title,
                description,
                assignedTo,
                dueDate,
                priority,
                completionPercentage,
                attachments
        );
        TaskResponse response = kanbanService.updateTask(taskId, request, files);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/tasks/{taskId}/assign")
    public ResponseEntity<TaskResponse> assignTask(
            @PathVariable String projectId,
            @PathVariable String taskId,
            @RequestParam String userId) {
        ensureCompanyUser();
        TaskResponse response = kanbanService.assignTask(taskId, userId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/tasks/{taskId}/comments")
    public ResponseEntity<TaskResponse> addTaskComment(
            @PathVariable String projectId,
            @PathVariable String taskId,
            @RequestParam String comment,
            Authentication authentication) {
        ensureCompanyUser();
        String userId = authentication != null ? authentication.getName() : "anonymous";
        String userName = userId;

        TaskResponse response = kanbanService.addTaskComment(taskId, userId, userName, comment);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/tasks/{taskId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TaskResponse> addTaskAttachments(
            @PathVariable String projectId,
            @PathVariable String taskId,
            @RequestParam("files") List<MultipartFile> files) {
        ensureCompanyUser();
        TaskResponse response = kanbanService.addTaskAttachments(taskId, files);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable String projectId,
            @PathVariable String taskId) {
        ensureCompanyUser();
        kanbanService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
    
    // ==================== STATISTICS ====================
    
    @GetMapping("/statistics")
    public ResponseEntity<KanbanStatisticsDTO> getKanbanStatistics(
            @PathVariable String projectId) {
        ensureCompanyUser();
        KanbanStatisticsDTO stats = kanbanService.getKanbanStatistics(projectId);
        return ResponseEntity.ok(stats);
    }
}
