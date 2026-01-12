package com.visionforge.crms.service;

import com.visionforge.crms.model.ChangeRequest;
import com.visionforge.crms.repository.ChangeRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ChangeRequestService {

    @Autowired
    private ChangeRequestRepository crRepository;

    // 1. Create a new Change Request (Client Feature)
    public ChangeRequest createChangeRequest(ChangeRequest cr) {
        cr.setStatus("PENDING_REVIEW"); // Default status
        return crRepository.save(cr);
    }

    // 2. Get all CRs for a Project (Dashboard View)
    public List<ChangeRequest> getRequestsByProject(String projectId) {
        return crRepository.findByProjectId(projectId);
    }

    // 3. Client Approves Proposal (Budget/Timeline Review)
    public ChangeRequest approveProposal(String crId) {
        ChangeRequest cr = crRepository.findById(crId).orElseThrow(() -> new RuntimeException("CR not found"));
        
        if (!"PROPOSAL_SENT".equals(cr.getStatus())) {
            throw new RuntimeException("Cannot approve. No proposal has been sent yet.");
        }
        
        cr.setStatus("APPROVED");
        // In the future: This is where you would trigger the "Auto-Update PRD" logic
        return crRepository.save(cr);
    }

    // 4. Client Rejects Proposal
    public ChangeRequest rejectProposal(String crId) {
        ChangeRequest cr = crRepository.findById(crId).orElseThrow(() -> new RuntimeException("CR not found"));
        cr.setStatus("REJECTED");
        return crRepository.save(cr);
    }
}
