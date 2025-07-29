package com.qt.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoryDto {
    private String userId;
    private String profilePicture;
    private String username;
    private Long storyId;
    private String storyUrl;
    private String storyType;
    private LocalDateTime storyTime;
    private String storyCaption;
    private boolean isViewed;

 
}
   
