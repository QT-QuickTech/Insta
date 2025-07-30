package com.qt.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.qt.backend.dto.CommentDto;
import com.qt.backend.dto.CommentRequest;
import com.qt.backend.model.Comment;
import com.qt.backend.model.Notification;
import com.qt.backend.model.Post;
import com.qt.backend.model.User;
import com.qt.backend.repo.NotificationRepository;
import com.qt.backend.repo.PostRepository;
import com.qt.backend.repo.UserRepository;
import com.qt.backend.repo.CommentRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final NotificationRepository notificationRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;


    public List<CommentDto> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId);

    }

    @Transactional
    public void addComment(CommentRequest commentRequest) {
        Long postIdLong = Long.valueOf(commentRequest.getPostId());
        Post post = postRepository.findById(postIdLong).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByUserId(commentRequest.getUserId());

        if (user == null)
            throw new RuntimeException("User not found");
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setText(commentRequest.getCommentText());
        commentRepository.save(comment);
        if(post.getUser().getUserId() != user.getUserId()){
            Notification notification = new Notification();
            notification.setUser(post.getUser());
            notification.setByUser(user);
            notification.setText("Commented "+commentRequest.getCommentText());
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

}
