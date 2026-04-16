package com.visionforge.crms.kanban.controller;

import com.visionforge.crms.kanban.dto.TaskResponse;
import com.visionforge.crms.kanban.service.KanbanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/company/kanban/my-tasks")
@RequiredArgsConstructor
public class MyTasksController {
    
    private final KanbanService kanbanService;
    
    @GetMapping("")
    public ResponseEntity<List<TaskResponse>> getMyTasks(Authentication authentication) {
        String userId = authentication.getName();
        List<TaskResponse> tasks = kanbanService.getTasksByAssignee(userId);
        return ResponseEntity.ok(tasks);
    }
}
