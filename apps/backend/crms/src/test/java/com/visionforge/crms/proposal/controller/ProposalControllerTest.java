package com.visionforge.crms.proposal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visionforge.crms.proposal.dto.CreateProposalRequest;
import com.visionforge.crms.proposal.dto.ProposalDecisionRequest;
import com.visionforge.crms.proposal.dto.ProposalResponse;
import com.visionforge.crms.proposal.model.ProposalStatus;
import com.visionforge.crms.proposal.service.ProposalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

@ExtendWith(MockitoExtension.class)
@DisplayName("Proposal Controller Tests")
class ProposalControllerTest {

    @Mock
    private ProposalService proposalService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private ProposalResponse proposalResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        mockMvc = standaloneSetup(new ProposalController(proposalService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();

        proposalResponse = ProposalResponse.builder()
                .id("proposal001")
                .title("E-Commerce Website")
                .description("Build website")
                .clientId("client001")
                .clientName("Test Client")
                .companyId("company001")
                .totalBudget(50000.0)
                .totalDurationDays(30)
                .status(ProposalStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("POST /api/company/proposals - Creates proposal")
    void createProposal_ReturnsCreatedProposal() throws Exception {
        CreateProposalRequest request = new CreateProposalRequest();
        request.setTitle("E-Commerce Website");
        request.setDescription("Build website");
        request.setClientId("client001");
        request.setClientName("Test Client");
        request.setTotalBudget(50000.0);
        request.setTotalDurationDays(30);

        when(proposalService.createProposal(any(CreateProposalRequest.class), eq("company001")))
                .thenReturn(proposalResponse);

        mockMvc.perform(post("/api/company/proposals")
                        .header("X-Company-Id", "company001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("proposal001"))
                .andExpect(jsonPath("$.title").value("E-Commerce Website"))
                .andExpect(jsonPath("$.companyId").value("company001"))
                .andExpect(jsonPath("$.status").value("PENDING"));

        verify(proposalService).createProposal(any(CreateProposalRequest.class), eq("company001"));
    }

    @Test
    @DisplayName("GET /api/company/proposals - Returns company proposals")
    void getCompanyProposals_ReturnsList() throws Exception {
        when(proposalService.getProposalsByCompany("company001"))
                .thenReturn(List.of(proposalResponse));

        mockMvc.perform(get("/api/company/proposals")
                        .header("X-Company-Id", "company001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value("proposal001"))
                .andExpect(jsonPath("$[0].clientId").value("client001"));

        verify(proposalService).getProposalsByCompany("company001");
    }

    @Test
    @DisplayName("GET /api/client/proposals - Returns current client proposals")
    void getClientProposals_ReturnsList() throws Exception {
        when(proposalService.getCurrentClientProposals())
                .thenReturn(List.of(proposalResponse));

        mockMvc.perform(get("/api/client/proposals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("E-Commerce Website"));

        verify(proposalService).getCurrentClientProposals();
    }

    @Test
    @DisplayName("GET /api/client/proposals/{id} - Returns proposal detail")
    void getClientProposalById_ReturnsProposal() throws Exception {
        when(proposalService.getCurrentClientProposalById("proposal001"))
                .thenReturn(proposalResponse);

        mockMvc.perform(get("/api/client/proposals/proposal001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("proposal001"))
                .andExpect(jsonPath("$.title").value("E-Commerce Website"));

        verify(proposalService).getCurrentClientProposalById("proposal001");
    }

    @Test
    @DisplayName("PATCH /api/client/proposals/{id}/accept - Accepts proposal")
    void acceptProposal_ReturnsAcceptedProposal() throws Exception {
        ProposalResponse acceptedResponse = ProposalResponse.builder()
                .id("proposal001")
                .title("E-Commerce Website")
                .companyId("company001")
                .clientId("client001")
                .status(ProposalStatus.ACCEPTED)
                .build();

        when(proposalService.acceptCurrentClientProposal("proposal001"))
                .thenReturn(acceptedResponse);

        mockMvc.perform(patch("/api/client/proposals/proposal001/accept"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("proposal001"))
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        verify(proposalService).acceptCurrentClientProposal("proposal001");
    }

    @Test
    @DisplayName("PATCH /api/client/proposals/{id}/reject - Rejects proposal")
    void rejectProposal_ReturnsRejectedProposal() throws Exception {
        ProposalDecisionRequest request = new ProposalDecisionRequest();
        request.setRejectionReason("Budget too high");

        ProposalResponse rejectedResponse = ProposalResponse.builder()
                .id("proposal001")
                .title("E-Commerce Website")
                .companyId("company001")
                .clientId("client001")
                .status(ProposalStatus.REJECTED)
                .rejectionReason("Budget too high")
                .build();

        when(proposalService.rejectCurrentClientProposal(eq("proposal001"), any(ProposalDecisionRequest.class)))
                .thenReturn(rejectedResponse);

        mockMvc.perform(patch("/api/client/proposals/proposal001/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("proposal001"))
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Budget too high"));

        verify(proposalService).rejectCurrentClientProposal(eq("proposal001"), any(ProposalDecisionRequest.class));
    }
}
