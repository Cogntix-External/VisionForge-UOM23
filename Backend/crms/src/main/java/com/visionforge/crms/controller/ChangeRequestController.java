package com.visionforge.crms.controller;

import com.visionforge.crms.model.ChangeRequest;
import com.visionforge.crms.service.ChangeRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/change-requests")
@CrossOrigin(origins = "*") // Allow frontend access
public class ChangeRequestController {

    @Autowired
    private ChangeRequestService crService;

    // GET: List all CRs for a specific project
    @GetMapping
    public List<ChangeRequest> getAllCRs(@PathVariable String projectId) {
        return crService.getRequestsByProject(projectId);
    }

    // POST: Create a new CR
    @PostMapping
    public ChangeRequest createCR(@PathVariable String projectId, @RequestBody ChangeRequest cr) {
        cr.setProjectId(projectId);
        return crService.createChangeRequest(cr);
    }

    // POST: Approve a Proposal
    @PostMapping("/{crId}/approve")
    public ChangeRequest approveCR(@PathVariable String crId) {
        return crService.approveProposal(crId);
    }
    
    // POST: Reject a Proposal
    @PostMapping("/{crId}/reject")
    public ChangeRequest rejectCR(@PathVariable String crId) {
        return crService.rejectProposal(crId);
    }
}
