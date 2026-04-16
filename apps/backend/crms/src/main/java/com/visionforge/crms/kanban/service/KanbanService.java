package com.visionforge.crms.kanban.service;

import com.visionforge.crms.kanban.dto.*;
import com.visionforge.crms.kanban.model.KanbanBoard;
import com.visionforge.crms.kanban.model.TaskAttachment;
import com.visionforge.crms.kanban.model.Task;
import com.visionforge.crms.kanban.model.TaskStatus;
import com.visionforge.crms.kanban.repository.KanbanBoardRepository;
import com.visionforge.crms.kanban.repository.TaskAttachmentRepository;
import com.visionforge.crms.kanban.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class KanbanService {
    private static final Logger log = LoggerFactory.getLogger(KanbanService.class);
    
    private final KanbanBoardRepository kanbanBoardRepository;
    private final TaskRepository taskRepository;
    private final TaskAttachmentRepository taskAttachmentRepository;
    
    // ==================== KANBAN BOARD OPERATIONS ====================
    
    public KanbanBoardResponse createKanbanBoard(String projectId, String companyId, 
                                                  CreateKanbanBoardRequest request, String userId) {
        KanbanBoard board = new KanbanBoard(projectId, companyId, request.getName(), 
                                            request.getDescription(), userId);
        KanbanBoard savedBoard = kanbanBoardRepository.save(board);
        return KanbanBoardResponse.from(savedBoard);
    }
    
    public KanbanBoardWithTasksResponse getKanbanBoardWithTasks(String projectId, String companyId) {
        KanbanBoard board = kanbanBoardRepository.findByProjectIdAndCompanyId(projectId, companyId)
                .orElseGet(() -> {
                    log.info("Creating default kanban board for projectId={} companyId={}", projectId, companyId);
                    KanbanBoard defaultBoard = new KanbanBoard(
                            projectId,
                            companyId,
                            "Project Board",
                            "Auto-created kanban board",
                            companyId != null ? companyId : "system"
                    );
                    return kanbanBoardRepository.save(defaultBoard);
                });
        
        List<Task> tasks = taskRepository.findByBoardId(board.getId());
        return KanbanBoardWithTasksResponse.from(board, tasks);
    }
    
    public KanbanBoardResponse getKanbanBoard(String boardId) {
        KanbanBoard board = kanbanBoardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Kanban board not found: " + boardId));
        return KanbanBoardResponse.from(board);
    }
    
    // ==================== TASK OPERATIONS ====================
    
    public TaskResponse createTask(String projectId, String boardId, String companyId,
                                   CreateTaskRequest request, String userId) {
        return createTask(projectId, boardId, companyId, request, userId, List.of());
    }

    public TaskResponse createTask(String projectId, String boardId, String companyId,
                                   CreateTaskRequest request, String userId, List<MultipartFile> files) {
        // Verify board exists
        KanbanBoard board = kanbanBoardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Kanban board not found: " + boardId));
        
        Task task = new Task(projectId, boardId, companyId, request.getTitle(),
                            request.getDescription(), userId);
        task.setAssignedTo(request.getAssignedTo());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        task.setCompletionPercentage(request.getCompletionPercentage() != null ? 
                                     request.getCompletionPercentage() : 0);
        task.setAttachments(new ArrayList<>());
        
        try {
            log.info("Creating task: projectId={}, boardId={}, title={}", projectId, boardId, request.getTitle());
            Task savedTask = taskRepository.save(task);
            savedTask.setAttachments(syncTaskAttachments(savedTask.getId(), request.getAttachments(), files));
            savedTask.setUpdatedAt(LocalDateTime.now());
            savedTask = taskRepository.save(savedTask);

            // Add task to board's taskIds list
            board.getTaskIds().add(savedTask.getId());
            board.setUpdatedAt(LocalDateTime.now());
            kanbanBoardRepository.save(board);

            log.info("Task saved: id={} title={}", savedTask.getId(), savedTask.getTitle());
            return TaskResponse.from(savedTask);
        } catch (Exception ex) {
            log.error("Failed to save task for boardId={} projectId={}: {}", boardId, projectId, ex.getMessage(), ex);
            throw ex;
        }
    }
    
    public List<TaskResponse> getTasksByBoard(String boardId) {
        return taskRepository.findByBoardId(boardId).stream()
                .map(TaskResponse::from)
                .collect(Collectors.toList());
    }
    
    public List<TaskResponse> getTasksByStatus(String boardId, TaskStatus status) {
        return taskRepository.findByBoardIdAndStatus(boardId, status).stream()
                .map(TaskResponse::from)
                .collect(Collectors.toList());
    }
    
    public TaskResponse getTask(String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        return TaskResponse.from(task);
    }
    
    public TaskResponse updateTaskStatus(String taskId, UpdateTaskStatusRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        
        task.setStatus(request.getStatus());
        if (request.getCompletionPercentage() != null) {
            task.setCompletionPercentage(request.getCompletionPercentage());
        }
        task.setUpdatedAt(LocalDateTime.now());
        
        Task updatedTask = taskRepository.save(task);
        return TaskResponse.from(updatedTask);
    }
    
    public TaskResponse updateTask(String taskId, CreateTaskRequest request) {
        return updateTask(taskId, request, List.of());
    }

    public TaskResponse updateTask(String taskId, CreateTaskRequest request, List<MultipartFile> files) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getAssignedTo() != null) {
            task.setAssignedTo(request.getAssignedTo());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getCompletionPercentage() != null) {
            task.setCompletionPercentage(request.getCompletionPercentage());
        }
        if (request.getAttachments() != null || hasUploadedFiles(files)) {
            task.setAttachments(syncTaskAttachments(taskId, request.getAttachments(), files));
        }
        
        task.setUpdatedAt(LocalDateTime.now());
        Task updatedTask = taskRepository.save(task);
        return TaskResponse.from(updatedTask);
    }
    
    public TaskResponse assignTask(String taskId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        
        task.setAssignedTo(userId);
        task.setUpdatedAt(LocalDateTime.now());
        Task updatedTask = taskRepository.save(task);
        return TaskResponse.from(updatedTask);
    }
    
    public TaskResponse addTaskComment(String taskId, String userId, String userName, String comment) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        
        Task.TaskComment taskComment = new Task.TaskComment(
                UUID.randomUUID().toString(),
                userId,
                userName,
                comment,
                LocalDateTime.now()
        );
        
        task.getComments().add(taskComment);
        task.setUpdatedAt(LocalDateTime.now());
        Task updatedTask = taskRepository.save(task);
        return TaskResponse.from(updatedTask);
    }

    public TaskResponse addTaskAttachments(String taskId, List<MultipartFile> files) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        task.setAttachments(syncTaskAttachments(taskId, task.getAttachments(), files));
        task.setUpdatedAt(LocalDateTime.now());

        Task updatedTask = taskRepository.save(task);
        return TaskResponse.from(updatedTask);
    }
    
    public void deleteTask(String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        
        // Remove from board's taskIds
        KanbanBoard board = kanbanBoardRepository.findById(task.getBoardId())
                .orElseThrow(() -> new RuntimeException("Kanban board not found: " + task.getBoardId()));
        board.getTaskIds().remove(taskId);
        kanbanBoardRepository.save(board);
        
        taskAttachmentRepository.deleteByTaskId(taskId);
        taskRepository.deleteById(taskId);
    }

    private List<String> syncTaskAttachments(String taskId, List<String> requestedAttachmentNames,
                                             List<MultipartFile> files) {
        List<TaskAttachment> existingAttachments = taskAttachmentRepository.findByTaskId(taskId);
        Map<String, TaskAttachment> existingByName = existingAttachments.stream()
                .filter(Objects::nonNull)
                .filter(attachment -> attachment.getFileName() != null && !attachment.getFileName().isBlank())
                .collect(Collectors.toMap(TaskAttachment::getFileName, attachment -> attachment, (first, second) -> second));

        LinkedHashSet<String> keptNames = new LinkedHashSet<>();
        if (requestedAttachmentNames == null) {
            existingByName.keySet().forEach(keptNames::add);
        } else {
            requestedAttachmentNames.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(name -> !name.isBlank())
                    .filter(existingByName::containsKey)
                    .forEach(keptNames::add);
        }

        for (TaskAttachment existingAttachment : existingAttachments) {
            if (!keptNames.contains(existingAttachment.getFileName())) {
                taskAttachmentRepository.delete(existingAttachment);
            }
        }

        for (MultipartFile file : normalizeFiles(files)) {
            String fileName = resolveFileName(file);
            TaskAttachment existingAttachment = existingByName.get(fileName);
            if (existingAttachment != null) {
                taskAttachmentRepository.delete(existingAttachment);
                keptNames.remove(fileName);
            }

            try {
                taskAttachmentRepository.save(new TaskAttachment(
                        taskId,
                        fileName,
                        file.getContentType(),
                        file.getSize(),
                        file.getBytes()
                ));
            } catch (IOException ex) {
                throw new RuntimeException("Failed to store attachment: " + fileName, ex);
            }
            keptNames.add(fileName);
        }

        return new ArrayList<>(keptNames);
    }

    private boolean hasUploadedFiles(List<MultipartFile> files) {
        return !normalizeFiles(files).isEmpty();
    }

    private List<MultipartFile> normalizeFiles(List<MultipartFile> files) {
        if (files == null) return List.of();
        return files.stream()
                .filter(Objects::nonNull)
                .filter(file -> !file.isEmpty())
                .collect(Collectors.toList());
    }

    private String resolveFileName(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName != null && !originalFileName.trim().isBlank()) {
            return originalFileName.trim();
        }
        return "attachment-" + UUID.randomUUID();
    }
    
    // ==================== DASHBOARD STATISTICS ====================
    
    public KanbanStatisticsDTO getKanbanStatistics(String projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        
        KanbanStatisticsDTO stats = new KanbanStatisticsDTO();
        stats.setTotalTasks(tasks.size());
        stats.setTodoTasks((int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count());
        stats.setInProgressTasks((int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count());
        stats.setInReviewTasks((int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count());
        stats.setDoneTasks((int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count());
        stats.setBlockedTasks((int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.BLOCKED).count());
        
        double avgCompletion = tasks.stream()
                .mapToInt(Task::getCompletionPercentage)
                .average()
                .orElse(0.0);
        stats.setAverageCompletion((int) avgCompletion);
        
        return stats;
    }
    
    public List<TaskResponse> getTasksByAssignee(String userId) {
        return taskRepository.findByAssignedTo(userId).stream()
                .map(TaskResponse::from)
                .collect(Collectors.toList());
    }
}
