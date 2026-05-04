package com.visionforge.crms.dashboard.dto;

import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.proposal.model.Proposal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientDashboardResponse {

    private long pendingProposalsCount;
    private long acceptedProjectsCount;
    private long pendingChangeRequestsCount;
    private long approvedChangeRequestsCount;

    private int progress;
    private int completion;

    private List<Proposal> recentProposals;
    private List<Project> recentProjects;
}