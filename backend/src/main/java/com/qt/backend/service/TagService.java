package com.qt.backend.service;

import java.util.List;

import com.qt.backend.dto.PostDto;
import com.qt.backend.model.Tag;
import com.qt.backend.repo.LikeRepository;

import com.qt.backend.repo.SaveRepository;

import com.qt.backend.repo.TagRepository;
import com.qt.backend.repo.CommentRepository;


import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final SaveRepository saveRepository;


    public List<PostDto> getTaggedPostsByUserId(String userId) {
        List<PostDto> posts =tagRepository.findTaggedPostsByUserId(userId);
        for(PostDto post:posts){
            post.setIsLiked(likeRepository.findAnyLikeByPostIdAndUserId(post.getPostId(), userId));
            post.setIsSaved(saveRepository.findAnySaveByPostIdAndUserId(post.getPostId(), userId));
            post.setLikes(likeRepository.findCountOfLikeByPostId(post.getPostId()));
            post.setComments(commentRepository.findCountOfCommentByPostId(post.getPostId()));
           
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
