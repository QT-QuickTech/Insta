package com.qt.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LikeDto {
    private Long likeId;
    private UserNameDto user;
    private LocalDateTime likeTime;

    public LikeDto(Long likeId, String userId, String profilePicture, String username, java.time.LocalDateTime likeTime) {
        this.likeId = likeId;
        this.user = new UserNameDto(userId, profilePicture, username);
        this.likeTime = likeTime;
    }
}
