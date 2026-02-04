package com.visionforge.crms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data; // Generates getters/setters automatically
import java.util.List;

// @Document tells Spring this class maps to the "users" collection in MongoDB [cite: 350]
@Document(collection = "users")
@Data 
public class User {

    @Id // This marks the primary key (_id) [cite: 569]
    private String id;

    private String fullName;      // [cite: 570]
    private String email;         // [cite: 571]
    private String passwordHash;  // [cite: 572]
    
    // Role can be "CLIENT", "ADMIN", etc. [cite: 573]
    private String role; 

    // Links to projects assigned to this user [cite: 574]
    private List<String> assignedProjectIds; 
}