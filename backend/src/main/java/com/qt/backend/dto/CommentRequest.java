package com.qt.backend.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private String userId;
    private String postId;
    private String commentText;
}
