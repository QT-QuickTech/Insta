package com.qt.backend.service;



import com.qt.backend.dto.NotificationDto;
import com.qt.backend.repo.FollowsRepository;
import com.qt.backend.repo.NotificationRepository;
import com.qt.backend.repo.PostRepository;
import com.qt.backend.repo.RequestRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class NotificationService {


    private final NotificationRepository notificationRepository;
    private final FollowsRepository followsRepository;
    private final PostRepository postRepository;
    private final RequestRepository requestRepository;

    public Page<NotificationDto> getNotifications(String userId, int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        Page<NotificationDto> notifications = notificationRepository.findByUser(userId, pageable);
        notifications.forEach(notificationDto -> {
            notificationDto.setType(checkType(notificationDto.getText()));
            // notificationDto.getUser().setIsFollowed(followsRepository.findAnyFollowByUserIdAndFollowingId(userId, notificationDto.getUser().getUserId()));
            // notificationDto.getUser().setPosts(postRepository.countPostsByUserId(notificationDto.getUser().getUserId()));
            // notificationDto.getUser().setFollowers(followsRepository.countFollowersByUserId(notificationDto.getUser().getUserId()));
            // notificationDto.getUser().setFollowing(followsRepository.countFollowingByUserId(notificationDto.getUser().getUserId()));
            // if(!notificationDto.getUser().isFollowed() && notificationDto.getUser().isPrivate()){
            //     notificationDto.getUser().setIsRequested(requestRepository.findByUserAndByUser(notificationDto.getUser().getUserId(), userId).isPresent());
            // }else{
            //     notificationDto.getUser().setIsRequested(false);
            // }
        });
        return notifications;
    }

    private String checkType(String text) {
        if (text.toLowerCase().contains("commented")) {
            return "comment";
        } else if (text.toLowerCase().contains("liked")) {
            return "like";
        } else if (text.toLowerCase().contains("followed")) {
            return "follow";
        }else if (text.toLowerCase().contains("requested")) {
            return "request";
        }else if (text.toLowerCase().contains("tagged")) {
            return "tag";
        }else if (text.toLowerCase().contains("accepted")) {
            return "accept";
        }
        return "other";
    }

}
