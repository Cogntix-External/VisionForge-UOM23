package com.visionforge.crms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "change_requests")
public class ChangeRequest {
    @Id
    private String id;

    private String projectId;       // Links to the Project
    private String raisedByUserId;  // The Client who asked for this
    
    private String title;
    private String description;
    private List<String> attachments; // Links to files (if any)
    
    // Status can be: "PENDING_REVIEW", "PROPOSAL_SENT", "APPROVED", "REJECTED"
    private String status = "PENDING_REVIEW"; 

    // Fields for the Company's Proposal (Januka's "Budget Review" feature)
    private Double proposedBudget;
    private Integer proposedTimelineDays;
    private String proposalNote;
    
    private Date createdAt = new Date();
}