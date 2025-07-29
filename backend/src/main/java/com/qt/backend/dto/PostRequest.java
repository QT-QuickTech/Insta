package com.qt.backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class PostRequest {
    private String mediaUrl;
    private String mediaType;
    private String caption;
    private String userId;
    private List<String> tags;
}
