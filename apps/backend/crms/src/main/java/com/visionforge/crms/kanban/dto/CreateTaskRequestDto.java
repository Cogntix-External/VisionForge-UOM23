package com.visionforge.crms.kanban.dto;

import lombok.Data;

@Data
public class CreateTaskRequestDto {

    private String title;
    private String status;     
    private String dueDate;
    private String priority;   
    private String assignedTo; 
}
