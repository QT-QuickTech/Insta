package com.qt.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserNameDto {
    private String userId;
    private String profilePicture;
    private String username;
}
