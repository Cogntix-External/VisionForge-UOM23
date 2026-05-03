package com.visionforge.crms.kanban.service;

import com.visionforge.crms.kanban.dto.KanbanBoardResponse;
import com.visionforge.crms.kanban.dto.KanbanProjectDto;
import com.visionforge.crms.kanban.model.KanbanBoard;
import com.visionforge.crms.kanban.model.KanbanComment;
import com.visionforge.crms.kanban.model.KanbanTask;
import com.visionforge.crms.kanban.repository.KanbanBoardRepository;
import com.visionforge.crms.kanban.repository.KanbanTaskRepository;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.user.CurrentUserService;
import com.visionforge.crms.user.Role;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Kanban Service Tests")
class KanbanServiceTest {

    @Mock
    private KanbanBoardRepository kanbanBoardRepository;

    @Mock
    private KanbanTaskRepository kanbanTaskRepository;

    @Mock
    private GridFsTemplate gridFsTemplate;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private KanbanService kanbanService;

    private Project project;
    private KanbanBoard board;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id("project-1")
                .name("Delivery Platform")
                .clientId("client-1")
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();

        board = KanbanBoard.builder()
                .id("board-1")
                .projectId("project-1")
                .title("Delivery Board")
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();
    }

    @Test
    @DisplayName("Get client kanban board returns grouped columns for client")
    void getClientProjectKanbanBoard_ReturnsGroupedColumns() {
        KanbanTask todoTask = KanbanTask.builder()
                .id("task-1")
                .projectId("project-1")
                .title("Design UI")
                .status("TODO")
                .priority("HIGH")
                .assignedTo("company-1")
                .build();

        KanbanTask blankStatusTask = KanbanTask.builder()
                .id("task-2")
                .projectId("project-1")
                .title("Write docs")
                .status("")
                .priority("LOW")
                .assignedTo("company-2")
                .build();

        KanbanTask doneTask = KanbanTask.builder()
                .id("task-3")
                .projectId("project-1")
                .title("Deploy app")
                .status("DONE")
                .priority("MEDIUM")
                .assignedTo("company-3")
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CLIENT);
        when(currentUserService.getCurrentUserId()).thenReturn("client-1");
        when(projectRepository.findByIdAndClientId("project-1", "client-1")).thenReturn(Optional.of(project));
        when(kanbanBoardRepository.findByProjectId("project-1")).thenReturn(Optional.of(board));
        when(kanbanTaskRepository.findByProjectId("project-1"))
                .thenReturn(List.of(todoTask, blankStatusTask, doneTask));

        KanbanBoardResponse response = kanbanService.getClientProjectKanbanBoard("project-1");

        assertEquals("board-1", response.getId());
        assertEquals(2, response.getColumns().size());
        assertEquals("TODO", response.getColumns().get(0).getId());
        assertEquals(2, response.getColumns().get(0).getTasks().size());
        assertEquals("DONE", response.getColumns().get(1).getId());
        assertEquals("Deploy app", response.getColumns().get(1).getTasks().get(0).getTitle());
    }

    @Test
    @DisplayName("Get client kanban board rejects non-client users")
    void getClientProjectKanbanBoard_WhenRoleIsNotClient_ThrowsException() {
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> kanbanService.getClientProjectKanbanBoard("project-1")
        );

        assertTrue(exception.getMessage().contains("Only client"));
    }

    @Test
    @DisplayName("Get company assignees filters verified company users")
    void getCompanyAssignees_FiltersUsers() {
        User verifiedCompany = User.builder()
                .id("company-1")
                .name("Alice")
                .email("alice@example.com")
                .role(Role.COMPANY)
                .emailVerified(true)
                .build();

        User unverifiedCompany = User.builder()
                .id("company-2")
                .name("Bob")
                .email("bob@example.com")
                .role(Role.COMPANY)
                .emailVerified(false)
                .build();

        User verifiedClient = User.builder()
                .id("client-1")
                .name("Carol")
                .email("carol@example.com")
                .role(Role.CLIENT)
                .emailVerified(true)
                .build();

        when(userRepository.findAll()).thenReturn(List.of(verifiedCompany, unverifiedCompany, verifiedClient));

        var assignees = kanbanService.getCompanyAssignees();

        assertEquals(1, assignees.size());
        assertEquals("Alice", assignees.get(0).getName());
    }

    @Test
    @DisplayName("Get assigned projects deduplicates tasks and falls back to board title")
    void getAssignedProjectsForCurrentUser_DeduplicatesAndFallsBackToBoardTitle() {
        User currentUser = User.builder()
                .id("company-1")
                .email("company@example.com")
                .build();

        KanbanTask taskOne = KanbanTask.builder().id("task-1").projectId("project-1").assignedTo("company-1").build();
        KanbanTask taskTwo = KanbanTask.builder().id("task-2").projectId("project-1").assignedTo("company-1").build();
        KanbanTask taskThree = KanbanTask.builder().id("task-3").projectId("project-2").assignedTo("company-1").build();

        when(currentUserService.getCurrentUser()).thenReturn(currentUser);
        when(kanbanTaskRepository.findByAssignedTo("company-1")).thenReturn(List.of(taskOne, taskTwo, taskThree));
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));
        when(projectRepository.findById("project-2")).thenReturn(Optional.empty());
        when(kanbanBoardRepository.findByProjectId("project-2")).thenReturn(Optional.of(
                KanbanBoard.builder().projectId("project-2").title("Fallback Board").build()
        ));

        List<KanbanProjectDto> result = kanbanService.getAssignedProjectsForCurrentUser();

        assertEquals(2, result.size());
        assertEquals("Delivery Platform", result.get(0).getName());
        assertEquals("Fallback Board", result.get(1).getName());
    }

    @Test
    @DisplayName("Add comment trims text and appends current user metadata")
    void addComment_TrimsTextAndSavesComment() {
        User currentUser = User.builder()
                .id("company-1")
                .name("Alice")
                .email("alice@example.com")
                .build();

        KanbanTask task = KanbanTask.builder()
                .id("task-1")
                .projectId("project-1")
                .title("Design UI")
                .comments(List.of())
                .build();

        when(kanbanTaskRepository.findById("task-1")).thenReturn(Optional.of(task));
        when(currentUserService.getCurrentUser()).thenReturn(currentUser);
        when(kanbanTaskRepository.save(any(KanbanTask.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(kanbanBoardRepository.findByProjectId("project-1")).thenReturn(Optional.of(board));
        when(kanbanBoardRepository.save(any(KanbanBoard.class))).thenAnswer(invocation -> invocation.getArgument(0));

        KanbanTask savedTask = kanbanService.addComment("project-1", "task-1", "  Looks good  ");

        assertEquals(1, savedTask.getComments().size());
        KanbanComment comment = savedTask.getComments().get(0);
        assertEquals("Alice", comment.getUserName());
        assertEquals("Looks good", comment.getComment());
        verify(kanbanTaskRepository).save(any(KanbanTask.class));
    }
}
