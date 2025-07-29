package com.qt.backend.dto;

import lombok.Data;

@Data
public class FollowRequest {
    private String userId;
    private String loggedInUserId;
}
