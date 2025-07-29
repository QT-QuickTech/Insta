package com.qt.backend.repo;

import java.util.List;

import com.qt.backend.dto.CommentDto;
import com.qt.backend.model.Comment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    @Query("SELECT new com.qt.backend.dto.CommentDto(c.commentId, c.text, c.createdAt, c.user.userId, c.user.profilePicture, c.user.username) " +
           "FROM Comment c WHERE c.post.postId = :postId")
    List<CommentDto> findByPostId(@Param("postId") Long postId);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.postId = :postId")
    Long findCountOfCommentByPostId(Long postId);

}
