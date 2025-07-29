package com.qt.backend.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import com.qt.backend.model.User;
import com.qt.backend.dto.UserDto;


public interface UserRepository extends JpaRepository<User, String> {

    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    User findByUserId(String userId);

    @Query("SELECT new com.qt.backend.dto.UserDto(u.userId, u.profilePicture, u.username, u.bio, u.isPrivate, false) FROM User u WHERE u.userId != :userId AND u.userId NOT IN (SELECT f.following.userId FROM Follows f WHERE f.follower.userId = :userId)")
    List<UserDto> findUsersNotFollowedBy(@Param("userId") String userId, Pageable pageable);



    @Query("SELECT new com.qt.backend.dto.UserDto(u.userId, u.profilePicture, u.username, u.bio, u.isPrivate, false) FROM User u WHERE u.userId = :userId AND u.password = :password")
    UserDto findByUserIdAndPassword(@Param("userId") String userId, @Param("password") String password);

    @Query("SELECT new com.qt.backend.dto.UserDto(u.userId, u.profilePicture, u.username, u.bio, u.isPrivate, false) FROM User u WHERE u.userId = :userId")
    UserDto findUserDtoByUserId(@Param("userId") String userId);
}
