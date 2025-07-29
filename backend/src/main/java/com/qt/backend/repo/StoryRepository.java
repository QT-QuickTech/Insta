package com.qt.backend.repo;

import java.util.List;

import com.qt.backend.dto.StoryDto;
import com.qt.backend.model.Story;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {

    @Query("SELECT new com.qt.backend.dto.StoryDto(" +
            "s.user.userId, s.user.profilePicture, s.user.username, " +
            "s.storyId, s.storyUrl, s.storyType, " +
            "s.createdAt, s.caption, " +
            "CASE WHEN sv.user.userId IS NOT NULL THEN true ELSE false END) " +
            "FROM Story s " +
            "LEFT JOIN StoryView sv ON sv.story = s AND sv.user.userId = :viewerId " +
            "WHERE s.user.userId IN :userIds")
    List<StoryDto> findByUserIdInWithViewStatus(@Param("userIds") List<String> userIds,
                                                @Param("viewerId") String viewerId);



    @Query("SELECT s FROM Story s WHERE s.user.userId = :userId")
    Story findByUserId(@Param("userId") String userId);

    
}


