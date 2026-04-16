package com.visionforge.crms.user;

import com.visionforge.crms.model.User;
import com.visionforge.crms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/company")
public class CompanyUserController {
    private static final Set<String> COMPANY_SIDE_ROLES = Set.of(
            "COMPANY",
            "ROLE_COMPANY",
            "ADMIN",
            "ROLE_ADMIN",
            "MANAGER",
            "ROLE_MANAGER"
    );

    private final UserRepository userRepository;

    public CompanyUserController(@Qualifier("clientUserRepository") UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Returns company-side users only for assignee dropdowns.
    @GetMapping("/users")
    public ResponseEntity<List<UserSummary>> getCompanyUsers(@RequestHeader(value = "X-Company-Id", required = false) String companyId) {
        List<User> users = userRepository.findAll();

        List<UserSummary> summaries = users.stream()
                .filter(this::isCompanySideUser)
                .map(u -> new UserSummary(u.getId(), u.getFullName(), u.getEmail()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(summaries);
    }

    private boolean isCompanySideUser(User user) {
        String role = user != null ? user.getRole() : null;
        if (role == null) {
            return false;
        }

        String normalizedRole = role.trim().toUpperCase(Locale.ROOT);
        return COMPANY_SIDE_ROLES.contains(normalizedRole);
    }

    public static class UserSummary {
        private String id;
        private String name;
        private String email;

        public UserSummary(String id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }

        public String getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
    }
}
