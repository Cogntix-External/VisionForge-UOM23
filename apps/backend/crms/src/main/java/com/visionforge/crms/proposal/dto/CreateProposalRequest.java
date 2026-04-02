package com.visionforge.crms.proposal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateProposalRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Client ID is required")
    private String clientId;

     private String companyId;
}