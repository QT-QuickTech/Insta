package com.qt.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDto {

    private Long id;
    private UserDto user;
    private String type;
    private String text;
    private LocalDateTime createdAt;

    public NotificationDto(Long id, String profilePicture, String userId, String username,String bio,boolean isPrivate,  String text, java.time.LocalDateTime createdAt) {
        this.id = id;
        this.user = new UserDto(userId, profilePicture, username,bio,isPrivate);
        this.text = text;
        this.createdAt = createdAt;
    }
    
}
