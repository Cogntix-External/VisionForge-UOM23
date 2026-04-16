package com.visionforge.crms.kanban.controller;
import com.visionforge.crms.kanban.dto.CreateTaskRequest;
import com.visionforge.crms.kanban.dto.TaskResponse;
import com.visionforge.crms.kanban.service.KanbanService;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientKanbanControllerTest {

    @Mock
    private KanbanService kanbanService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ClientKanbanController clientKanbanController;

    @Test
    void createTaskDelegatesToKanbanServiceAndReturnsCreatedResponse() {
        CreateTaskRequest request = new CreateTaskRequest(
                "Client task",
                "Created from client portal",
                "assignee-1",
                LocalDateTime.of(2026, 4, 20, 9, 0),
                "HIGH",
                25,
                List.of("client-brief.pdf")
        );

        TaskResponse serviceResponse = new TaskResponse();
        serviceResponse.setId("task-1");
        serviceResponse.setProjectId("project-1");
        serviceResponse.setBoardId("board-1");
        serviceResponse.setCompanyId("company-1");
        serviceResponse.setTitle("Client task");

        when(authentication.getPrincipal()).thenReturn("company-1");
        when(authentication.getName()).thenReturn("client-user-1");
        when(kanbanService.createTask(
                "project-1",
                "board-1",
                "company-1",
                request,
                "client-user-1"
        )).thenReturn(serviceResponse);

        ResponseEntity<TaskResponse> response = clientKanbanController.createTask(
                "project-1",
                "board-1",
                request,
                authentication
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(serviceResponse, response.getBody());
        verify(kanbanService).createTask("project-1", "board-1", "company-1", request, "client-user-1");
    }
}
