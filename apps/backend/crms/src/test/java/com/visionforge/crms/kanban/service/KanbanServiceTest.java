package com.visionforge.crms.kanban.service;

import com.visionforge.crms.kanban.dto.KanbanBoardResponse;
import com.visionforge.crms.kanban.model.KanbanBoard;
import com.visionforge.crms.kanban.model.KanbanColumn;
import com.visionforge.crms.kanban.model.KanbanTask;
import com.visionforge.crms.kanban.repository.KanbanBoardRepository;
import com.visionforge.crms.kanban.repository.KanbanTaskRepository;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.user.CurrentUserService;
import com.visionforge.crms.user.Role;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KanbanServiceTest {

    @Mock private KanbanBoardRepository kanbanBoardRepository;
    @Mock private KanbanTaskRepository kanbanTaskRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private CurrentUserService currentUserService;

    @InjectMocks
    private KanbanService kanbanService;

    @Test
    void clientShouldViewOwnProjectKanbanBoard() {
        Project project = Project.builder()
                .id("project-1")
                .clientId("client-1")
                .companyId("company-1")
                .build();

        KanbanBoard board = KanbanBoard.builder()
                .id("board-1")
                .projectId("project-1")
                .clientId("client-1")
                .companyId("company-1")
                .columns(List.of(
                        KanbanColumn.builder()
                                .id("todo")
                                .title("To Do")
                                .tasks(List.of(
                                        KanbanTask.builder()
                                                .id("task-1")
                                                .title("UI Update")
                                                .description("Update login UI")
                                                .priority("High")
                                                .assignedTo("company-team")
                                                .build()
                                ))
                                .build()
                ))
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CLIENT);
        when(currentUserService.getCurrentUserId()).thenReturn("client-1");
        when(projectRepository.findByIdAndClientId("project-1", "client-1"))
                .thenReturn(Optional.of(project));
        when(kanbanBoardRepository.findByProjectId("project-1"))
                .thenReturn(Optional.of(board));
        when(kanbanTaskRepository.findByProjectId("project-1"))
                .thenReturn(board.getColumns().get(0).getTasks());

        KanbanBoardResponse result =
                kanbanService.getClientProjectKanbanBoard("project-1");

        assertEquals("board-1", result.getId());
        assertEquals("project-1", result.getProjectId());
        assertEquals("TODO", result.getColumns().get(0).getTitle());
        assertEquals("UI Update", result.getColumns().get(0).getTasks().get(0).getTitle());
    }
}