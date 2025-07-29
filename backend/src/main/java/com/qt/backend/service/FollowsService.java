package com.qt.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import com.qt.backend.dto.UserDto;
import com.qt.backend.model.Follows;
import com.qt.backend.model.Notification;
import com.qt.backend.repo.FollowsRepository;
import com.qt.backend.repo.NotificationRepository;
import com.qt.backend.repo.PostRepository;
import com.qt.backend.repo.RequestRepository;
import com.qt.backend.repo.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FollowsService {
    private final FollowsRepository followsRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationRepository  notificationRepository;
    private final RequestRepository requestRepository;

    public List<UserDto> getFollowersByUserId(String userId, String loggedInUserId) {
        List<UserDto> users = followsRepository.findFollowersByUserId(userId);
        for (UserDto user : users) {
            user.setIsFollowed(isFollowing(loggedInUserId, user.getUserId()));
            user.setPosts(postRepository.countPostsByUserId(user.getUserId()));
            user.setFollowers(followsRepository.countFollowersByUserId(user.getUserId()));
            user.setFollowing(followsRepository.countFollowingByUserId(user.getUserId()));
            if(!user.isFollowed() && user.isPrivate()){
                user.setIsRequested(requestRepository.findByUserAndByUser(user.getUserId(), userId).isPresent());
            }else{
                user.setIsRequested(false);
            }
        }
        return users;
    }

    public List<UserDto> getFollowingByUserId(String userId, String loggedInUserId) {
        List<UserDto> users = followsRepository.findFollowingByUserId(userId);
        for (UserDto user : users) {
            user.setIsFollowed(isFollowing(loggedInUserId, user.getUserId()));
            user.setFollowers(followsRepository.countFollowersByUserId(user.getUserId()));
            user.setFollowing(followsRepository.countFollowingByUserId(user.getUserId()));
            if(!user.isFollowed() && user.isPrivate()){
                user.setIsRequested(requestRepository.findByUserAndByUser(user.getUserId(), userId).isPresent());
            }else{
                user.setIsRequested(false);
            }
        }

        return users;

    }

    public boolean isFollowing(String user1, String user2) {
        return followsRepository.findAnyFollowByUserIdAndFollowingId(user1, user2);
    }

    public void followUser(String userId, String loggedInUserId) {
        if (isFollowing(loggedInUserId, userId)) {
            throw new RuntimeException("User already followed");
        }
        Follows follow = new Follows();
        follow.setFollower(userRepository.findByUserId(loggedInUserId));
        follow.setFollowing(userRepository.findByUserId(userId));
        followsRepository.save(follow);
        Notification notification = new Notification();
        notification.setUser(userRepository.findByUserId(userId));
        notification.setByUser(userRepository.findByUserId(loggedInUserId));
        notification.setText("Followed you");   
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public void unfollowUser(String userId, String loggedInUserId) {
        Follows follow = followsRepository.findByFollowerIdAndFollowingId(loggedInUserId, userId);
        if (follow == null) {
            throw new RuntimeException("Follow relationship not found");
        }
        followsRepository.delete(follow);
    }

}
