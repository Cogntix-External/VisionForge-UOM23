package com.visionforge.crms.dashboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visionforge.crms.dashboard.dto.ClientDashboardResponse;
import com.visionforge.crms.dashboard.dto.CompanyDashboardResponse;
import com.visionforge.crms.dashboard.dto.CompanyDashboardResponse.ProjectTableRow;
import com.visionforge.crms.dashboard.service.DashboardService;
import com.visionforge.crms.user.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

@ExtendWith(MockitoExtension.class)
@DisplayName("Dashboard Controller Tests")
class DashboardControllerTest {

    @Mock
    private DashboardService dashboardService;
    @Mock
    private CurrentUserService currentUserService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();

        mockMvc = standaloneSetup(new DashboardController(dashboardService, currentUserService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    @DisplayName("GET /api/company/dashboard - Returns company dashboard")
    void getCompanyDashboard_ReturnsDashboard() throws Exception {
        CompanyDashboardResponse response = CompanyDashboardResponse.builder()
                .totalProjects(4)
                .pendingApprovals(2)
                .totalProposals(6)
                .acceptedProposals(3)
                .rejectedProposals(1)
                .activeProjects(2)
                .recentProjects(List.of(ProjectTableRow.builder()
                        .id("project001")
                        .projectName("E-Commerce Website")
                        .status("ACTIVE")
                        .owner("Test Company")
                        .lastUpdated("2026-04-29")
                        .build()))
                .build();

        when(currentUserService.getCurrentUserId()).thenReturn("company001");
        when(dashboardService.getCompanyDashboard("company001")).thenReturn(response);

        mockMvc.perform(get("/api/company/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProjects").value(4))
                .andExpect(jsonPath("$.pendingApprovals").value(2))
                .andExpect(jsonPath("$.totalProposals").value(6))
                .andExpect(jsonPath("$.acceptedProposals").value(3))
                .andExpect(jsonPath("$.rejectedProposals").value(1))
                .andExpect(jsonPath("$.activeProjects").value(2))
                .andExpect(jsonPath("$.recentProjects", hasSize(1)))
                .andExpect(jsonPath("$.recentProjects[0].projectName").value("E-Commerce Website"));

        verify(currentUserService).getCurrentUserId();
        verify(dashboardService).getCompanyDashboard("company001");
    }

    @Test
    @DisplayName("GET /api/client/dashboard - Returns client dashboard")
    void getClientDashboard_ReturnsDashboard() throws Exception {
        ClientDashboardResponse response = ClientDashboardResponse.builder()
                .pendingProposalsCount(2)
                .acceptedProjectsCount(3)
                .pendingChangeRequestsCount(1)
                .approvedChangeRequestsCount(4)
                .recentProposals(List.of())
                .recentProjects(List.of())
                .build();

        when(currentUserService.getCurrentUserId()).thenReturn("client001");
        when(dashboardService.getClientDashboard("client001")).thenReturn(response);

        mockMvc.perform(get("/api/client/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendingProposalsCount").value(2))
                .andExpect(jsonPath("$.acceptedProjectsCount").value(3))
                .andExpect(jsonPath("$.pendingChangeRequestsCount").value(1))
                .andExpect(jsonPath("$.approvedChangeRequestsCount").value(4))
                .andExpect(jsonPath("$.recentProposals", hasSize(0)))
                .andExpect(jsonPath("$.recentProjects", hasSize(0)));

        verify(currentUserService).getCurrentUserId();
        verify(dashboardService).getClientDashboard("client001");
    }
}
