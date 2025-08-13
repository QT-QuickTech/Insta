package com.qt.backend.service;

import com.qt.backend.dto.PostDto;
import com.qt.backend.dto.PostRequest;
import com.qt.backend.model.Notification;
import com.qt.backend.model.Post;
import com.qt.backend.model.Tag;
import com.qt.backend.model.User;
import com.qt.backend.repo.LikeRepository;
import com.qt.backend.repo.PostRepository;
import com.qt.backend.repo.RequestRepository;
import com.qt.backend.repo.CommentRepository;
import com.qt.backend.repo.SaveRepository;
import com.qt.backend.repo.FollowsRepository;
import com.qt.backend.repo.UserRepository;
import com.qt.backend.repo.TagRepository;
import com.qt.backend.repo.NotificationRepository;
import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class PostService {

    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final SaveRepository saveRepository;
    private final FollowsRepository followsRepository;
    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final NotificationRepository notificationRepository;



    public List<PostDto> getPostsByUserId(String userId, String loggedInUserId) {
        
            List<PostDto> posts = postRepository.findPostsByUserId(userId);
            boolean isFollowed=followsRepository.findAnyFollowByUserIdAndFollowingId( loggedInUserId, userId) || loggedInUserId.equals(userId);
            for (PostDto post : posts) {
                post.setLikes(likeRepository.findCountOfLikeByPostId(post.getPostId()));
                post.setComments(commentRepository.findCountOfCommentByPostId(post.getPostId()));
                post.setIsLiked(likeRepository.findAnyLikeByPostIdAndUserId(post.getPostId(), loggedInUserId));
                post.setIsSaved(saveRepository.findAnySaveByPostIdAndUserId(post.getPostId(), loggedInUserId));
                post.getUser().setIsFollowed(isFollowed);
                if(!post.getUser().isFollowed() && post.getUser().isPrivate()){
                    post.getUser().setIsRequested(requestRepository.findByUserAndByUser(post.getUser().getUserId(), loggedInUserId).isPresent());
                }else{
                    post.getUser().setIsRequested(false);
                }
            }
            return posts;
       
    }

    public List<PostDto> getFeedPostsForUser(String userId, int page) {
      
            HashSet<String> followingIds = new HashSet<>(followsRepository.findFollowingNamesByUserId(userId));
            List<PostDto> feeds = postRepository.findFeedPostsForUser(userId, followingIds, PageRequest.of(page, 10));
            for (PostDto feed : feeds) {
                feed.setLikes(likeRepository.findCountOfLikeByPostId(feed.getPostId()));
                feed.setComments(commentRepository.findCountOfCommentByPostId(feed.getPostId()));
                feed.setIsSaved(saveRepository.findAnySaveByPostIdAndUserId(feed.getPostId(), userId));
                feed.setIsLiked(false);
            }
            return feeds;
        
       
    }

    public List<PostDto> getReelsPostsForUser(String userId, int page) {
     
            HashSet<String> followingIds = new HashSet<>(followsRepository.findFollowingNamesByUserId(userId));
            List<PostDto> reels = postRepository.findReelsPostsForUser(userId, followingIds, PageRequest.of(page, 5));
            for (PostDto reel : reels) {
                reel.setLikes(likeRepository.findCountOfLikeByPostId(reel.getPostId()));
                reel.setComments(commentRepository.findCountOfCommentByPostId(reel.getPostId()));
                reel.setIsLiked(false);
                reel.setIsSaved(saveRepository.findAnySaveByPostIdAndUserId(reel.getPostId(), userId));
                reel.getUser().setIsFollowed(followsRepository.findAnyFollowByUserIdAndFollowingId(userId, reel.getUser().getUserId()));
                if(!reel.getUser().isFollowed() && reel.getUser().isPrivate()){
                    reel.getUser().setIsRequested(requestRepository.findByUserAndByUser(reel.getUser().getUserId(), userId).isPresent());
                }else{
                    reel.getUser().setIsRequested(false);
                }
            }
            return reels;
        
    }

   

    public PostDto getPostById(Long postId, String userId) {
        PostDto post = postRepository.findPostDtoById(postId);
        post.setLikes(likeRepository.findCountOfLikeByPostId(postId));
        post.setComments(commentRepository.findCountOfCommentByPostId(postId));
        post.setIsLiked(likeRepository.findAnyLikeByPostIdAndUserId(postId, userId));
        post.setIsSaved(saveRepository.findAnySaveByPostIdAndUserId(postId, userId));
        return post;
    }

    public void deletePost(Long postId) {
        Post post =postRepository.getByPostId(postId);
        if (post == null) {
            throw new RuntimeException("post not found");
        }
        postRepository.delete(post);
    }

    public void createPost(PostRequest postDto) {
        Post post = new Post();
        post.setCaption(postDto.getCaption());
        post.setMediaUrl(postDto.getMediaUrl());
        post.setMediaType(postDto.getMediaType());
        User user = userRepository.findById(postDto.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
        post.setUser(user);
        userRepository.save(user);
        postRepository.save(post);
        for(String userId : postDto.getTags()){
            Tag tag = new Tag();
            tag.setPost(post);
            tag.setUser(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Post was created but User not found for given tag")));
            tagRepository.save(tag);
            Notification notification = new Notification();
            notification.setUser(tag.getUser());
            notification.setByUser(user);
            notification.setText("tagged you in a post");
            notificationRepository.save(notification);

        }
    }

  
}
