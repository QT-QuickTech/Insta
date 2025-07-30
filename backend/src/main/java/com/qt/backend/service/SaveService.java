package com.qt.backend.service;

import java.util.List;

import com.qt.backend.dto.PostDto;
import com.qt.backend.repo.SaveRepository;
import com.qt.backend.model.Save;
import com.qt.backend.model.Post;
import com.qt.backend.model.User;
import com.qt.backend.repo.PostRepository;
import com.qt.backend.repo.RequestRepository;
import com.qt.backend.repo.UserRepository;
import com.qt.backend.repo.CommentRepository;
import com.qt.backend.repo.FollowsRepository;

import org.springframework.stereotype.Service;
import com.qt.backend.repo.LikeRepository;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SaveService {

    private final SaveRepository saveRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final FollowsRepository followsRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RequestRepository requestRepository;

    public List<PostDto> getSavedPosts(String userId) {
        List<PostDto> posts = saveRepository.findSavedPostsByUserId(userId);
        for (PostDto post : posts) {
            post.setLikes(likeRepository.findCountOfLikeByPostId(post.getPostId()));
            post.setComments(commentRepository.findCountOfCommentByPostId(post.getPostId()));
            post.setIsLiked(likeRepository.findAnyLikeByPostIdAndUserId(post.getPostId(), userId));
            post.setIsSaved(true);
            // post.getUser().setIsFollowed(
                    // followsRepository.findAnyFollowByUserIdAndFollowingId(userId, post.getUser().getUserId()));
            // post.getUser().setPosts(postRepository.countPostsByUserId(post.getUser().getUserId()));
            // post.getUser().setFollowers(followsRepository.countFollowersByUserId(post.getUser().getUserId()));
            // post.getUser().setFollowing(followsRepository.countFollowingByUserId(post.getUser().getUserId()));
            // if(!post.getUser().isFollowed() && post.getUser().isPrivate()){
            //     post.getUser().setIsRequested(requestRepository.findByUserAndByUser(post.getUser().getUserId(), userId).isPresent());
            // }else{
            //     post.getUser().setIsRequested(false);
            // }
        }
        return posts;
    }

    @Transactional
    public void savePost(String userId, Long postId) {
      
        if (saveRepository.findAnySaveByPostIdAndUserId(postId, userId)) {
            throw new RuntimeException("Post already saved");
        }
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByUserId(userId);
        if (user == null)
            throw new RuntimeException("User not found");
        Save save = new Save();
        save.setPost(post);
        save.setUser(user);
        saveRepository.save(save);
    }

    @Transactional
    public void unsavePost(String userId, Long postId) {
        Save save = saveRepository.findByPostIdAndUserId(postId, userId);
        if (save == null) {
            throw new RuntimeException("Save not found");
        }
        saveRepository.delete(save);
    }

}
