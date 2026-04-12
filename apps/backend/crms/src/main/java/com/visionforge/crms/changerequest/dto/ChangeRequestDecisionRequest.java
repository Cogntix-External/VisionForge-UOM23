package com.visionforge.crms.changerequest.dto;

import lombok.Data;

@Data
public class ChangeRequestDecisionRequest {
    private Boolean accepted;
    private String decisionReason;
    private String rejectionReason;
}