package com.visionforge.crms.user;

import com.visionforge.crms.model.User;
import com.visionforge.crms.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CompanyUserControllerTest {

    @Test
    void getCompanyUsersReturnsOnlyCompanySideAccounts() {
        UserRepository userRepository = mock(UserRepository.class);
        CompanyUserController controller = new CompanyUserController(userRepository);

        User clientUser = new User();
        clientUser.setId("client-1");
        clientUser.setFullName("Client User");
        clientUser.setEmail("client@example.com");
        clientUser.setRole("ROLE_CLIENT");

        User companyUser = new User();
        companyUser.setId("company-1");
        companyUser.setFullName("Company User");
        companyUser.setEmail("company@example.com");
        companyUser.setRole("COMPANY");

        User adminUser = new User();
        adminUser.setId("admin-1");
        adminUser.setFullName("Admin User");
        adminUser.setEmail("admin@example.com");
        adminUser.setRole("ADMIN");

        when(userRepository.findAll()).thenReturn(List.of(clientUser, companyUser, adminUser));

        ResponseEntity<List<CompanyUserController.UserSummary>> response =
                controller.getCompanyUsers(Optional.of("company-1").orElse(null));

        assertEquals(2, response.getBody().size());
        assertIterableEquals(
                List.of("company@example.com", "admin@example.com"),
                response.getBody().stream().map(CompanyUserController.UserSummary::getEmail).toList()
        );
    }
}
