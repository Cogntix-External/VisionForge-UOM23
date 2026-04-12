package com.visionforge.crms.changerequest.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateChangeRequestRequest {

    private String prdId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private Double budget;
    private String timeline;
    private String priority;
}