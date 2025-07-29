package com.qt.backend.repo;

import com.qt.backend.dto.PostDto;
import com.qt.backend.model.Save;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SaveRepository extends JpaRepository<Save, Long> {

    @Query("SELECT COUNT(s) > 0 FROM Save s WHERE s.post.postId = :postId AND s.user.userId = :userId")
    boolean findAnySaveByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") String userId);

    @Query("SELECT new com.qt.backend.dto.PostDto(s.post.postId, s.post.mediaUrl, s.post.mediaType, s.post.caption, s.post.createdAt, s.post.user.userId, s.post.user.profilePicture, s.post.user.username, s.post.user.bio, s.post.user.isPrivate) "
            +
            "FROM Save s " +
            "WHERE s.user.userId = :userId")
    List<PostDto> findSavedPostsByUserId(String userId);

    @Query("SELECT s FROM Save s WHERE s.post.postId = :postId AND s.user.userId = :userId")
    Save findByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") String userId);
}