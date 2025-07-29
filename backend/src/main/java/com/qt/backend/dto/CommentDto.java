package com.qt.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private Long commentId;
    private String commentText;
    private LocalDateTime commentTime;
    private UserNameDto user;

    public CommentDto(Long commentId, String text, java.time.LocalDateTime createdAt, String   userId, String profilePicture, String username) {
        this.commentId = commentId;
        this.commentText = text;
        this.commentTime = createdAt;
        this.user = new UserNameDto(userId, profilePicture, username);
    }
}
