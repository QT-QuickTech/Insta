package com.qt.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qt.backend.dto.PostDto;
import com.qt.backend.dto.SaveRequest;
import com.qt.backend.service.SaveService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/saves")
@RequiredArgsConstructor
public class SaveControler {


    private final SaveService saveService;


    @GetMapping("/{userId}")
    public ResponseEntity<?> getSavesByUserId(@PathVariable String userId) {
        try {
            List<PostDto> saves = saveService.getSavedPosts(userId);
            return ResponseEntity.ok(saves);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> savePost(@RequestBody SaveRequest saveRequest) {
        try {
            saveService.savePost(saveRequest.getUserId(), saveRequest.getPostId());
            return ResponseEntity.ok(java.util.Map.of("message", "Post saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> unsavePost(@RequestBody SaveRequest saveRequest) {
        try {
            saveService.unsavePost(saveRequest.getUserId(), saveRequest.getPostId());
            return ResponseEntity.ok(java.util.Map.of("message", "Post unsaved successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
