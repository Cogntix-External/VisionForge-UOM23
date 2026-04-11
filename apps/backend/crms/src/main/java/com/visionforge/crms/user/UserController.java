package com.visionforge.crms.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/client")
public class UserController {

    @GetMapping("/welcome")
    public String clientWelcome() {
        return "Welcome Client Portal";
    }
}