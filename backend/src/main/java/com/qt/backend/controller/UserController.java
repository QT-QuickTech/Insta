package com.qt.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qt.backend.dto.UserDto;
import com.qt.backend.dto.UserPasswordCheckDto;
import com.qt.backend.dto.UserRequest;
import com.qt.backend.service.UserService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUser(@PathVariable String userId) {
        try {
            UserDto user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/suggestions")
    public ResponseEntity<?> getUserSuggestions(@PathVariable String userId) {
        try {
            List<UserDto> suggestions = userService.getUserSuggestions(userId);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> checkPassword(@RequestBody UserPasswordCheckDto userPasswordCheckDto) {
        UserDto user = userService.checkPassword(userPasswordCheckDto);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(401).body(java.util.Map.of("error", "invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRequest userRequest) {
        try {
            System.out.println("userRequest: " + userRequest);
            UserDto user = userService.registerUser(userRequest);
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "User is created successfully",
                    "user", user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

}
