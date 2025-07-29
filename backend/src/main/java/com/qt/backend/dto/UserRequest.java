package com.qt.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    private String userId;
    private String username;
    private String email;
    private String password;
    private String bio;
    private String profilePicture;
    private boolean isPrivate;

    public void setIsPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }
    public boolean isPrivate() {
        return isPrivate;
    }
   
}
