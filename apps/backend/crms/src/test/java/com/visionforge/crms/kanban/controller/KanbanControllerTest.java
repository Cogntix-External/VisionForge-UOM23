package com.visionforge.crms.kanban.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visionforge.crms.kanban.dto.KanbanBoardResponse;
import com.visionforge.crms.kanban.model.KanbanAttachment;
import com.visionforge.crms.kanban.model.KanbanBoard;
import com.visionforge.crms.kanban.service.KanbanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.converter.ResourceHttpMessageConverter;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

@ExtendWith(MockitoExtension.class)
@DisplayName("Kanban Controller Tests")
class KanbanControllerTest {

    @Mock
    private KanbanService kanbanService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = standaloneSetup(new KanbanController(kanbanService))
                .setMessageConverters(
                        new JacksonJsonHttpMessageConverter(),
                        new ResourceHttpMessageConverter()
                )
                .build();
    }

    @Test
    @DisplayName("GET /api/client/projects/{projectId}/kanban returns board response")
    void getClientProjectKanban_ReturnsBoard() throws Exception {
        KanbanBoardResponse response = KanbanBoardResponse.builder()
                .id("board-1")
                .projectId("project-1")
                .build();

        when(kanbanService.getClientProjectKanbanBoard("project-1")).thenReturn(response);

        mockMvc.perform(get("/api/client/projects/project-1/kanban"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("board-1"))
                .andExpect(jsonPath("$.projectId").value("project-1"));

        verify(kanbanService).getClientProjectKanbanBoard("project-1");
    }

    @Test
    @DisplayName("POST /api/company/kanban/{projectId}/board prefers name field and trims it")
    void saveBoard_UsesTrimmedNameField() throws Exception {
        KanbanBoard board = KanbanBoard.builder()
                .id("board-1")
                .projectId("project-1")
                .title("Delivery Board")
                .build();

        when(kanbanService.touchBoard("project-1", "Delivery Board")).thenReturn(board);

        mockMvc.perform(post("/api/company/kanban/project-1/board")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "  Delivery Board  ",
                                "title", "Ignored Title"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Delivery Board"));

        verify(kanbanService).touchBoard("project-1", "Delivery Board");
    }

    @Test
    @DisplayName("GET attachment download falls back to octet stream and sanitizes filename")
    void downloadTaskAttachment_UsesSafeHeaders() throws Exception {
        KanbanAttachment attachment = new KanbanAttachment(
                "attachment-1",
                "re\"port.pdf",
                "bad/type??",
                4L,
                Instant.now()
        );

        when(kanbanService.getAttachmentMetadata("project-1", "task-1", "attachment-1"))
                .thenReturn(attachment);
        when(kanbanService.getAttachmentResource(eq("project-1"), eq("task-1"), eq(attachment)))
                .thenReturn(new ByteArrayResource("demo".getBytes()));

        mockMvc.perform(get("/api/company/kanban/project-1/tasks/task-1/attachments/attachment-1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_OCTET_STREAM))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"report.pdf\""))
                .andExpect(header().longValue("Content-Length", 4L));
    }

    @Test
    @DisplayName("DELETE /api/company/kanban/{projectId}/tasks/{taskId} returns no content")
    void deleteTask_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/company/kanban/project-1/tasks/task-1"))
                .andExpect(status().isNoContent());

        verify(kanbanService).deleteTask("project-1", "task-1");
    }
}
