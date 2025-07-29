package com.qt.backend.repo;


import com.qt.backend.model.Tag;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.qt.backend.dto.PostDto;

public interface TagRepository extends JpaRepository<Tag, Long> {

    @Query("SELECT new com.qt.backend.dto.PostDto(t.post.postId, t.post.mediaUrl, t.post.mediaType, t.post.caption, t.post.createdAt, t.post.user.userId, t.post.user.profilePicture, t.post.user.username, t.post.user.bio, t.post.user.isPrivate) "
                            +
                        "FROM Tag t " +
                        "WHERE t.user.userId = :userId")
    List<PostDto> findTaggedPostsByUserId(@Param("userId") String userId);

    @Query("SELECT t FROM Tag t WHERE t.user.userId = :userId  AND t.post.postId = :postId")
    Tag deleteTag(Long postId, String userId);

}
