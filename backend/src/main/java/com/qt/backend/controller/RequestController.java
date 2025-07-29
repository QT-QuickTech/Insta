package com.qt.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import com.qt.backend.service.RequestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
    
    private final RequestService requestService;

    @PostMapping("/create/{userId}")
    public ResponseEntity<?> createRequest(@PathVariable String userId, @RequestParam String  loggedInUserId) {
        try {
            System.out.println("userId: " + userId);
            System.out.println("loggedInUserId: " + loggedInUserId);
            System.out.println("createRequest");
            requestService.createRequest(userId, loggedInUserId);
            return ResponseEntity.ok(java.util.Map.of("message", "Request created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }
    @PutMapping("/accept/{userId}")
    public ResponseEntity<?> acceptRequest(@PathVariable String userId, @RequestParam String  loggedInUserId) {
        try {
            System.out.println("userId: " + userId);
            System.out.println("loggedInUserId: " + loggedInUserId);
            System.out.println("acceptRequest");
            requestService.acceptRequest(userId, loggedInUserId);
            return ResponseEntity.ok(java.util.Map.of("message", "Request accepted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }


    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<?> deleteRequest(@PathVariable String userId, @RequestParam String  loggedInUserId) {
        try {
            requestService.deleteRequest(userId, loggedInUserId);
            return ResponseEntity.ok(java.util.Map.of("message", "Request deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }
    @DeleteMapping("/cancel/{userId}")
    public ResponseEntity<?> cancelRequest(@PathVariable String userId, @RequestParam String  loggedInUserId) {
        try {
            requestService.deleteRequest(loggedInUserId, userId);
            return ResponseEntity.ok(java.util.Map.of("message", "Request cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
