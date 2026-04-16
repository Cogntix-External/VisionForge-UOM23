package com.visionforge.crms.kanban.service;

import com.visionforge.crms.kanban.dto.CreateTaskRequest;
import com.visionforge.crms.kanban.dto.KanbanBoardWithTasksResponse;
import com.visionforge.crms.kanban.dto.TaskResponse;
import com.visionforge.crms.kanban.model.KanbanBoard;
import com.visionforge.crms.kanban.model.Task;
import com.visionforge.crms.kanban.model.TaskAttachment;
import com.visionforge.crms.kanban.model.TaskStatus;
import com.visionforge.crms.kanban.repository.KanbanBoardRepository;
import com.visionforge.crms.kanban.repository.TaskAttachmentRepository;
import com.visionforge.crms.kanban.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KanbanServiceTest {

    @Mock
    private KanbanBoardRepository kanbanBoardRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskAttachmentRepository taskAttachmentRepository;

    @InjectMocks
    private KanbanService kanbanService;

    @Test
    void getKanbanBoardWithTasksCreatesDefaultBoardWhenMissing() {
        when(kanbanBoardRepository.findByProjectIdAndCompanyId("project-1", "company-1"))
                .thenReturn(Optional.empty());
        when(kanbanBoardRepository.save(any(KanbanBoard.class))).thenAnswer(invocation -> {
            KanbanBoard board = invocation.getArgument(0);
            board.setId("board-1");
            return board;
        });
        when(taskRepository.findByBoardId("board-1")).thenReturn(List.of());

        KanbanBoardWithTasksResponse response = kanbanService.getKanbanBoardWithTasks("project-1", "company-1");

        assertEquals("board-1", response.getId());
        assertEquals("project-1", response.getProjectId());
        assertEquals("company-1", response.getCompanyId());
        assertEquals("Project Board", response.getName());
        assertNotNull(response.getTasksByStatus());
        assertEquals(TaskStatus.values().length, response.getTasksByStatus().size());

        verify(kanbanBoardRepository).save(any(KanbanBoard.class));
        verify(taskRepository).findByBoardId("board-1");
    }

    @Test
    void createTaskPersistsTaskAndLinksItToBoard() {
        KanbanBoard existingBoard = new KanbanBoard(
                "project-1",
                "company-1",
                "Project Board",
                "Auto-created kanban board",
                "creator-1"
        );
        existingBoard.setId("board-1");
        existingBoard.setTaskIds(new ArrayList<>());

        CreateTaskRequest request = new CreateTaskRequest(
                "Persisted ticket",
                "Needs to be stored",
                "assignee-1",
                LocalDateTime.of(2026, 4, 25, 12, 0),
                "HIGH",
                50,
                List.of("design.pdf")
        );
        MockMultipartFile attachment = new MockMultipartFile(
                "files",
                "design.pdf",
                "application/pdf",
                "pdf-content".getBytes()
        );

        when(kanbanBoardRepository.findById("board-1")).thenReturn(Optional.of(existingBoard));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            if (task.getId() == null) {
                task.setId("task-1");
            }
            return task;
        });
        when(kanbanBoardRepository.save(any(KanbanBoard.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskAttachmentRepository.findByTaskId("task-1")).thenReturn(List.of());
        when(taskAttachmentRepository.save(any(TaskAttachment.class))).thenAnswer(invocation -> {
            TaskAttachment savedAttachment = invocation.getArgument(0);
            savedAttachment.setId("attachment-1");
            return savedAttachment;
        });

        TaskResponse response = kanbanService.createTask(
                "project-1",
                "board-1",
                "company-1",
                request,
                "user-1",
                List.of(attachment)
        );

        assertEquals("task-1", response.getId());
        assertEquals("project-1", response.getProjectId());
        assertEquals("board-1", response.getBoardId());
        assertEquals("company-1", response.getCompanyId());
        assertEquals("Persisted ticket", response.getTitle());
        assertEquals("assignee-1", response.getAssignedTo());
        assertEquals("HIGH", response.getPriority());
        assertEquals(50, response.getCompletionPercentage());
        assertEquals(List.of("design.pdf"), response.getAttachments());

        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository, atLeastOnce()).save(taskCaptor.capture());
        List<Task> savedTasks = taskCaptor.getAllValues();
        Task savedTask = savedTasks.get(savedTasks.size() - 1);
        assertEquals("project-1", savedTask.getProjectId());
        assertEquals("board-1", savedTask.getBoardId());
        assertEquals("company-1", savedTask.getCompanyId());
        assertEquals("Persisted ticket", savedTask.getTitle());
        assertEquals("Needs to be stored", savedTask.getDescription());
        assertEquals("assignee-1", savedTask.getAssignedTo());
        assertEquals("HIGH", savedTask.getPriority());
        assertEquals(50, savedTask.getCompletionPercentage());
        assertEquals(List.of("design.pdf"), savedTask.getAttachments());

        ArgumentCaptor<TaskAttachment> attachmentCaptor = ArgumentCaptor.forClass(TaskAttachment.class);
        verify(taskAttachmentRepository).save(attachmentCaptor.capture());
        TaskAttachment savedAttachment = attachmentCaptor.getValue();
        assertEquals("task-1", savedAttachment.getTaskId());
        assertEquals("design.pdf", savedAttachment.getFileName());

        ArgumentCaptor<KanbanBoard> boardCaptor = ArgumentCaptor.forClass(KanbanBoard.class);
        verify(kanbanBoardRepository).save(boardCaptor.capture());
        KanbanBoard savedBoard = boardCaptor.getValue();
        assertFalse(savedBoard.getTaskIds().isEmpty());
        assertTrue(savedBoard.getTaskIds().contains("task-1"));
    }

    @Test
    void updateTaskReplacesAttachmentListWhenProvided() {
        Task existingTask = new Task(
                "project-1",
                "board-1",
                "company-1",
                "Existing ticket",
                "Original description",
                "creator-1"
        );
        existingTask.setId("task-1");
        existingTask.setAttachments(new ArrayList<>(List.of("old-file.txt")));

        CreateTaskRequest request = new CreateTaskRequest(
                "Updated ticket",
                "Updated description",
                "assignee-2",
                LocalDateTime.of(2026, 5, 1, 10, 0),
                "MEDIUM",
                20,
                List.of()
        );
        MockMultipartFile replacementAttachment = new MockMultipartFile(
                "files",
                "updated-spec.pdf",
                "application/pdf",
                "updated-content".getBytes()
        );

        when(taskRepository.findById("task-1")).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskAttachmentRepository.findByTaskId("task-1")).thenReturn(List.of(
                new TaskAttachment("attachment-1", "task-1", "old-file.txt", "text/plain", 10L, "old".getBytes(), LocalDateTime.now())
        ));
        when(taskAttachmentRepository.save(any(TaskAttachment.class))).thenAnswer(invocation -> {
            TaskAttachment savedAttachment = invocation.getArgument(0);
            savedAttachment.setId("attachment-2");
            return savedAttachment;
        });

        TaskResponse response = kanbanService.updateTask("task-1", request, List.of(replacementAttachment));

        assertEquals(List.of("updated-spec.pdf"), response.getAttachments());

        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(taskCaptor.capture());
        assertEquals(List.of("updated-spec.pdf"), taskCaptor.getValue().getAttachments());

        ArgumentCaptor<TaskAttachment> attachmentCaptor = ArgumentCaptor.forClass(TaskAttachment.class);
        verify(taskAttachmentRepository).save(attachmentCaptor.capture());
        assertEquals("updated-spec.pdf", attachmentCaptor.getValue().getFileName());
    }

    @Test
    void addTaskAttachmentsKeepsExistingAttachmentsAndAddsNewFiles() {
        Task existingTask = new Task(
                "project-1",
                "board-1",
                "company-1",
                "Existing ticket",
                "Original description",
                "creator-1"
        );
        existingTask.setId("task-1");
        existingTask.setAttachments(new ArrayList<>(List.of("old-file.txt")));

        MockMultipartFile newAttachment = new MockMultipartFile(
                "files",
                "diagram.png",
                "image/png",
                "png-content".getBytes()
        );

        when(taskRepository.findById("task-1")).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskAttachmentRepository.findByTaskId("task-1")).thenReturn(List.of(
                new TaskAttachment("attachment-1", "task-1", "old-file.txt", "text/plain", 10L, "old".getBytes(), LocalDateTime.now())
        ));
        when(taskAttachmentRepository.save(any(TaskAttachment.class))).thenAnswer(invocation -> {
            TaskAttachment savedAttachment = invocation.getArgument(0);
            savedAttachment.setId("attachment-2");
            return savedAttachment;
        });

        TaskResponse response = kanbanService.addTaskAttachments("task-1", List.of(newAttachment));

        assertEquals(List.of("old-file.txt", "diagram.png"), response.getAttachments());

        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository, atLeastOnce()).save(taskCaptor.capture());
        assertEquals(List.of("old-file.txt", "diagram.png"), taskCaptor.getValue().getAttachments());
    }
}
