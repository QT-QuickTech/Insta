package com.qt.backend.dto;
import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class UserDto {
    private String userId;
    private String profilePicture;
    private String username;
    private String bio;
    private boolean isPrivate;
    private boolean isFollowed;
    private Long posts;
    private Long followers;
    private Long following;
    private boolean isRequested;
    private LocalDateTime viewedAt;

    public UserDto(String userId, String profilePicture, String username,String bio, boolean isPrivate) {
        this.userId = userId;
        this.profilePicture = profilePicture;
        this.username = username;
        this.bio = bio;
        this.isPrivate = isPrivate;
    }
    public UserDto(String userId, String profilePicture, String username,String bio, boolean isPrivate ,LocalDateTime viewedAt) {
        this.userId = userId;
        this.profilePicture = profilePicture;
        this.username = username;
        this.bio = bio;
        this.isPrivate = isPrivate;
        this.viewedAt = viewedAt;
    }

    public UserDto(String userId, String profilePicture, String username,String bio, boolean isPrivate, boolean isFollowed) {
        this.userId = userId;
        this.profilePicture = profilePicture;
        this.username = username;
        this.bio = bio;
        this.isPrivate = isPrivate;
        this.isFollowed = isFollowed;
    }

    public void setIsFollowed(boolean isFollowed) {
        this.isFollowed = isFollowed;
    }
    public void setIsRequested(boolean isRequested) {
        this.isRequested = isRequested;
    }
}
