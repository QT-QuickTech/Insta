package com.qt.backend.service;

import java.util.List;

import com.qt.backend.dto.PostDto;
import com.qt.backend.model.Tag;
import com.qt.backend.repo.LikeRepository;
import com.qt.backend.repo.PostRepository;
import com.qt.backend.repo.SaveRepository;
import com.qt.backend.repo.FollowsRepository;
import com.qt.backend.repo.TagRepository;
import com.qt.backend.repo.CommentRepository;
import com.qt.backend.repo.RequestRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final SaveRepository saveRepository;
    private final FollowsRepository followsRepository;
    private final PostRepository postRepository;
    private final RequestRepository requestRepository;

    public List<PostDto> getTaggedPostsByUserId(String userId) {
        List<PostDto> posts =tagRepository.findTaggedPostsByUserId(userId);
        for(PostDto post:posts){
            post.setIsLiked(likeRepository.findAnyLikeByPostIdAndUserId(post.getPostId(), userId));
            post.setIsSaved(saveRepository.findAnySaveByPostIdAndUserId(post.getPostId(), userId));
            post.setLikes(likeRepository.findCountOfLikeByPostId(post.getPostId()));
            post.setComments(commentRepository.findCountOfCommentByPostId(post.getPostId()));
            post.getUser().setIsFollowed(followsRepository.findAnyFollowByUserIdAndFollowingId(userId, post.getUser().getUserId()));
            post.getUser().setPosts(postRepository.countPostsByUserId(post.getUser().getUserId()));
            post.getUser().setFollowers(followsRepository.countFollowersByUserId(post.getUser().getUserId()));
            post.getUser().setFollowing(followsRepository.countFollowingByUserId(post.getUser().getUserId()));
            if(!post.getUser().isFollowed() && post.getUser().isPrivate()){
                post.getUser().setIsRequested(requestRepository.findByUserAndByUser(post.getUser().getUserId(), userId).isPresent());
            }else{
                post.getUser().setIsRequested(false);
            }
        }
        return posts;
    }

    public void deleteTag(Long postId, String userId) {
        Tag tag =tagRepository.deleteTag(postId,userId);
        if (tag == null) {
            throw new RuntimeException("tag not found");
        }
        tagRepository.delete(tag);
    }
 

}
