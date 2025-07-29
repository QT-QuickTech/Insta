package com.qt.backend.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import com.qt.backend.dto.UserDto;
import com.qt.backend.model.Story;
import com.qt.backend.model.StoryView;

@Repository
public interface StoryViewRepository extends JpaRepository<StoryView, Long> {

    @Query("SELECT new com.qt.backend.dto.UserDto(s.user.userId, s.user.profilePicture, s.user.username, s.user.bio, s.user.isPrivate, s.createdAt) FROM StoryView s WHERE s.story = :story")
    List<UserDto> findByStory(Story story);

}
