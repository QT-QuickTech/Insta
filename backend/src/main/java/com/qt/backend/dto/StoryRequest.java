package com.qt.backend.dto;

import lombok.Data;

@Data
public class StoryRequest {
    private String storyUrl;
    private String storyType;
    private String caption;
    private String userId;
}
