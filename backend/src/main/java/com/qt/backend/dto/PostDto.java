package com.qt.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private Long postId;
    private String mediaUrl;
    private String mediaType;
    private String caption;
    private LocalDateTime createdAt;
    private Long likes;
    private Long comments;
    private boolean isLiked;
    private boolean isSaved;
    private UserDto user;
   

    public PostDto(Long postId, String mediaUrl, String mediaType, String caption, java.time.LocalDateTime createdAt, String userId, String profilePicture, String username,String bio, boolean isPrivate) {
        this.postId = postId;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.caption = caption;
        this.createdAt = createdAt;
        this.user = new UserDto(userId,profilePicture,username,bio,isPrivate);
    }

    public void setIsLiked(boolean isLiked) {
        this.isLiked = isLiked;
    }
    public void setIsSaved(boolean isSaved) {
        this.isSaved = isSaved;
    }
   
}

