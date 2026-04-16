package com.visionforge.crms.project.service;

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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void getProjectsByCompanyReturnsAllProjectsForCompanyUsers() {
        Project projectOne = Project.builder().id("project-1").name("Project One").companyId("company-a").build();
        Project projectTwo = Project.builder().id("project-2").name("Project Two").companyId("company-b").build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.COMPANY);
        when(projectRepository.findAll()).thenReturn(List.of(projectOne, projectTwo));

        var response = projectService.getProjectsByCompany("company-a");

        assertEquals(2, response.size());
        assertEquals("project-1", response.get(0).getId());
        assertEquals("project-2", response.get(1).getId());
        verify(projectRepository).findAll();
    }
}
