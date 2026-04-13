package com.visionforge.crms.changerequest.dto;

import lombok.Data;

@Data
public class ChangeRequestImplementationRequest {
    private String implementedVersion;
    private String implementationNotes;
}