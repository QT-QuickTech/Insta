package com.qt.backend.dto;

import lombok.Data;

@Data
public class LikeRequest {
    private Long postId;
    private String userId;
}
