package com.visionforge.crms.config;

import com.visionforge.crms.user.Role;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("client@gmail.com").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Client User")
                    .email("client@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.CLIENT)
                    .build());
        }

        if (userRepository.findByEmail("company@gmail.com").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Company User")
                    .email("company@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.COMPANY)
                    .build());
        }
    }
}