package com.visionforge.crms.kanban.controller;
import com.visionforge.crms.kanban.dto.CreateTaskRequest;
import com.visionforge.crms.kanban.dto.KanbanBoardWithTasksResponse;
import com.visionforge.crms.kanban.dto.TaskResponse;
import com.visionforge.crms.kanban.service.KanbanService;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.user.CurrentUserService;
import com.visionforge.crms.user.Role;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KanbanControllerTest {

    @Mock
    private KanbanService kanbanService;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private KanbanController kanbanController;

    @Test
    void getKanbanBoardAllowsAnyCompanyUserAndUsesProjectCompanyId() {
        Project project = Project.builder()
                .id("project-1")
                .companyId("owner-company-id")
                .build();

        KanbanBoardWithTasksResponse serviceResponse = new KanbanBoardWithTasksResponse();
        serviceResponse.setId("board-1");
        serviceResponse.setProjectId("project-1");
        serviceResponse.setCompanyId("owner-company-id");

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));
        when(kanbanService.getKanbanBoardWithTasks("project-1", "owner-company-id"))
                .thenReturn(serviceResponse);

        ResponseEntity<KanbanBoardWithTasksResponse> response =
                kanbanController.getKanbanBoard("project-1", authentication, "another-company-user-id");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(serviceResponse, response.getBody());
        verify(kanbanService).getKanbanBoardWithTasks("project-1", "owner-company-id");
    }

    @Test
    void createTaskAllowsAnyCompanyUserAndStoresProjectCompanyId() {
        Project project = Project.builder()
                .id("project-1")
                .companyId("owner-company-id")
                .build();

        CreateTaskRequest request = new CreateTaskRequest(
                "Shared task",
                "Created by another company user",
                "assignee-1",
                LocalDateTime.of(2026, 4, 20, 9, 0),
                "HIGH",
                30,
                List.of("ticket.png")
        );

        TaskResponse serviceResponse = new TaskResponse();
        serviceResponse.setId("task-1");
        serviceResponse.setProjectId("project-1");
        serviceResponse.setBoardId("board-1");
        serviceResponse.setCompanyId("owner-company-id");

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));
        when(authentication.getName()).thenReturn("teammate@example.com");
        when(kanbanService.createTask(
                "project-1",
                "board-1",
                "owner-company-id",
                request,
                "teammate@example.com"
        )).thenReturn(serviceResponse);

        ResponseEntity<TaskResponse> response = kanbanController.createTask(
                "project-1",
                "board-1",
                request,
                authentication,
                "another-company-user-id"
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(serviceResponse, response.getBody());
        verify(kanbanService).createTask(
                "project-1",
                "board-1",
                "owner-company-id",
                request,
                "teammate@example.com"
        );
    }
}
