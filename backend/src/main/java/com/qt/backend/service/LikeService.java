package com.qt.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import com.qt.backend.dto.LikeDto;
import com.qt.backend.repo.LikeRepository;
import com.qt.backend.repo.NotificationRepository;
import com.qt.backend.model.Post;
import com.qt.backend.model.User;
import com.qt.backend.model.Like;
import com.qt.backend.model.Notification;
import com.qt.backend.repo.PostRepository;
import com.qt.backend.repo.UserRepository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public List<LikeDto> getLikesByPostId(Long postId) {
        return likeRepository.findByPostId(postId);
    }

    @Transactional
    public void likePost(Long postId, String userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByUserId(userId);
        if (user == null)
            throw new RuntimeException("User not found");
        // Optionally, check if already liked
        if (likeRepository.findAnyLikeByPostIdAndUserId(postId, userId)) {
            throw new RuntimeException("User already liked this post");
        }
        Like like = new Like();
        like.setPost(post);
        like.setUser(user);
        likeRepository.save(like);
        if(post.getUser().getUserId() != user.getUserId()){
            Notification notification = new Notification();
            notification.setUser(post.getUser());
            notification.setByUser(user);
            notification.setText("Liked your post");
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void unlikePost(Long postId, String userId) {
        Like like = likeRepository.findByPostIdAndUserId(postId, userId);
        if (like == null) {
            throw new RuntimeException("Like not found");
        }
        likeRepository.delete(like);
    }
}
