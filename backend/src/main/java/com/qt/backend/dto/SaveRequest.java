package com.qt.backend.dto;

import lombok.Data;

@Data
public class SaveRequest {
    private String userId;
    private Long postId;
}
