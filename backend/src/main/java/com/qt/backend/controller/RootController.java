package com.qt.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// This is the root controller for the backend
@RestController
public class RootController {
    @GetMapping("/")
    public String index() {
        return "Instagram backend is up!";
    }
}
