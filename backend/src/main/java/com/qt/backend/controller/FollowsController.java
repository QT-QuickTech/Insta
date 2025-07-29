package com.qt.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qt.backend.dto.FollowRequest;
import com.qt.backend.dto.UserDto;
import com.qt.backend.service.FollowsService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowsController {

    private final FollowsService followsService;

    @GetMapping("/followers/{userId}")
    public ResponseEntity<?> getFollowers(@PathVariable String userId , @RequestParam String loggedInUserId) {
        try {
            List<UserDto> followers = followsService.getFollowersByUserId(userId, loggedInUserId);
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<?> getFollowing(@PathVariable String userId, @RequestParam String loggedInUserId) {
        try {
            List<UserDto> following = followsService.getFollowingByUserId(userId, loggedInUserId);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> isFollowing(@RequestParam String user1, @RequestParam String user2) {
        try {
            boolean isFollowing = followsService.isFollowing(user1, user2);
            return ResponseEntity.ok(isFollowing);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> followUser(@RequestBody FollowRequest followRequest) {
        try {
            followsService.followUser(followRequest.getUserId(), followRequest.getLoggedInUserId());
            return ResponseEntity.ok(java.util.Map.of("message", "User followed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> unfollowUser(@RequestBody FollowRequest followRequest) {
        try {
            followsService.unfollowUser(followRequest.getUserId(), followRequest.getLoggedInUserId());
            return ResponseEntity.ok(java.util.Map.of("message", "Unfollowed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
