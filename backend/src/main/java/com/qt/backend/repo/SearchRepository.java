package com.qt.backend.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.qt.backend.dto.UserDto;
import com.qt.backend.model.User;

public interface SearchRepository extends JpaRepository<User, String> {

    @Query("SELECT new com.qt.backend.dto.UserDto(u.userId, u.profilePicture, u.username, u.bio, u.isPrivate) "
    + "FROM User u "
    + "WHERE u.username LIKE %:query% OR u.userId LIKE %:query% AND u.userId != :userId")
    List<UserDto> searchPosts(String query, org.springframework.data.domain.Pageable pageable,String userId);
    

}
