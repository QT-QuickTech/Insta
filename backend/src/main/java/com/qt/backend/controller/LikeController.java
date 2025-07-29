package com.qt.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.qt.backend.dto.LikeDto;
import com.qt.backend.service.LikeService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import com.qt.backend.dto.LikeRequest;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @GetMapping("/{postId}")
    public ResponseEntity<?> getLikesByPostId(@PathVariable Long postId) {
        try {
            List<LikeDto> likes = likeService.getLikesByPostId(postId);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> likePost(@RequestBody LikeRequest likeRequest) {
        try {
            likeService.likePost(likeRequest.getPostId(), likeRequest.getUserId());
            return ResponseEntity.ok(java.util.Map.of("message", "Post liked successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> unlikePost(@RequestBody LikeRequest likeRequest) {
        try {
            likeService.unlikePost(likeRequest.getPostId(), likeRequest.getUserId());
            return ResponseEntity.ok(java.util.Map.of("message", "Post unliked successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
