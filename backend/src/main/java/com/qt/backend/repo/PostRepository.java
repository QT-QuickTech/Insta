package com.qt.backend.repo;

import java.util.HashSet;
import java.util.List;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.qt.backend.dto.PostDto;
import com.qt.backend.model.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

        // @Query("SELECT new com.qt.backend.dto.PostDto(p.postId, p.mediaUrl, p.mediaType, p.caption, p.createdAt, p.user.userId, p.user.profilePicture, p.user.username) "
        //                 +
        //                 "FROM Post p WHERE p.postId = :postId")
        // PostDto findPostDtoById(@Param("postId") Long postId);

        @Query("SELECT new com.qt.backend.dto.PostDto(p.postId, p.mediaUrl, p.mediaType, p.caption, p.createdAt, p.user.userId, p.user.profilePicture, p.user.username, p.user.bio, p.user.isPrivate) "
                        +
                        "FROM Post p WHERE p.user.userId = :userId")
        List<PostDto> findPostsByUserId(@Param("userId") String userId);

        @Query("SELECT new com.qt.backend.dto.PostDto(p.postId, p.mediaUrl, p.mediaType, p.caption, p.createdAt, p.user.userId, p.user.profilePicture, p.user.username, p.user.bio, p.user.isPrivate) "
                        +
                        "FROM Post p " +
                        "WHERE (p.user.userId IN :followingIds OR p.user.isPrivate = false) " +
                        "AND p.postId NOT IN (SELECT l.post.postId FROM Like l WHERE l.user.userId = :userId)"+
                        "AND p.user.userId != :userId"+" order by p.createdAt desc")
        List<PostDto> findFeedPostsForUser(@Param("userId") String userId,
                        @Param("followingIds") HashSet<String> followingIds, Pageable pageable);

        @Query("SELECT new com.qt.backend.dto.PostDto(p.postId, p.mediaUrl, p.mediaType, p.caption, p.createdAt, p.user.userId, p.user.profilePicture, p.user.username, p.user.bio, p.user.isPrivate) "
                        +
                        "FROM Post p " +
                        "WHERE (p.user.userId IN :followingIds OR p.user.isPrivate = false) " +
                        "AND p.mediaType = 'video' " +
                        "AND p.postId NOT IN (SELECT l.post.postId FROM Like l WHERE l.user.userId = :userId)")
        List<PostDto> findReelsPostsForUser(@Param("userId") String userId,
                        @Param("followingIds") HashSet<String> followingIds, Pageable pageable);
                        
        @Query("SELECT new com.qt.backend.dto.PostDto(p.postId, p.mediaUrl, p.mediaType, p.caption, p.createdAt, p.user.userId, p.user.profilePicture, p.user.username, p.user.bio, p.user.isPrivate) "
                        +
                        "FROM Post p WHERE p.postId = :postId")
        PostDto findPostDtoById(Long postId);

        @Query("SELECT COUNT(p) FROM Post p WHERE p.user.userId = :userId")
        Long countPostsByUserId(@Param("userId") String userId);

        @Query("SELECT p FROM Post p WHERE p.postId = :postId")
        Post getByPostId(Long postId);

}
