package com.visionforge.crms.kanban.controller;

import com.visionforge.crms.kanban.dto.KanbanBoardResponse;
import com.visionforge.crms.kanban.dto.KanbanColumnResponse;
import com.visionforge.crms.kanban.dto.KanbanTaskResponse;
import com.visionforge.crms.kanban.service.KanbanService;
import com.visionforge.crms.config.JwtService;
import com.visionforge.crms.security.JwtFilter;
import com.visionforge.crms.security.JwtUtil;
import com.visionforge.crms.user.CustomerUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(KanbanController.class)
@AutoConfigureMockMvc(addFilters = false)
class KanbanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private KanbanService kanbanService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomerUserDetailsService userDetailsService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private JwtFilter jwtFilter;

    @Test
    void shouldReturnClientProjectKanbanBoard() throws Exception {
        KanbanBoardResponse response = KanbanBoardResponse.builder()
                .id("board-1")
                .projectId("project-1")
                .clientId("client-1")
                .companyId("company-1")
                .columns(List.of(
                        KanbanColumnResponse.builder()
                                .id("todo")
                                .title("To Do")
                                .tasks(List.of(
                                        KanbanTaskResponse.builder()
                                                .id("task-1")
                                                .title("UI Update")
                                                .description("Update login page")
                                                .priority("Medium")
                                                .assignedTo("company-team")
                                                .build()
                                ))
                                .build()
                ))
                .build();

        when(kanbanService.getClientProjectKanbanBoard("project-1"))
                .thenReturn(response);

        mockMvc.perform(get("/api/client/projects/project-1/kanban"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("board-1"))
                .andExpect(jsonPath("$.columns[0].title").value("To Do"))
                .andExpect(jsonPath("$.columns[0].tasks[0].title").value("UI Update"));
    }
}