package com.visionforge.crms.changerequest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VersionHistoryTableRowResponse {
    private String projectId;
    private String prdId;
    private String clientId;
}