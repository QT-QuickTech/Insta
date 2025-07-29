package com.qt.backend.repo;

import java.util.List;

import com.qt.backend.dto.LikeDto;
import com.qt.backend.model.Like;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    @Query("SELECT new com.qt.backend.dto.LikeDto(l.likeId, l.user.userId, l.user.profilePicture, l.user.username, l.createdAt) "
            +
            "FROM Like l WHERE l.post.postId = :postId")
    List<LikeDto> findByPostId(@Param("postId") Long postId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.post.postId = :postId")
    Long findCountOfLikeByPostId(Long postId);

    @Query("SELECT COUNT(l) > 0 FROM Like l WHERE l.post.postId = :postId AND l.user.userId = :userId")
    boolean findAnyLikeByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") String userId);

    @Query("SELECT l FROM Like l WHERE l.post.postId = :postId AND l.user.userId = :userId")
    Like findByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") String userId);

}
