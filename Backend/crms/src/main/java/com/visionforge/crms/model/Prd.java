package com.visionforge.crms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;

@Data
@Document(collection = "prds")
public class Prd {
    @Id
    private String id;
    
    private String projectId;
    private String versionNumber; // e.g., "v1.0", "v1.1"
    private String content;       // The actual text of the requirements
    private String status;        // "DRAFT", "FINAL"
    
    private Date createdDate = new Date();
}
