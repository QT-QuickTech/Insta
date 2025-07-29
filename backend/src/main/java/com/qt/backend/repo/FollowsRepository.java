package com.qt.backend.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.qt.backend.dto.UserDto;
import com.qt.backend.model.Follows;

@Repository
public interface FollowsRepository extends JpaRepository<Follows, Long> {

    // Get followers of a user (people who follow the user)
    @Query("SELECT new com.qt.backend.dto.UserDto(f.follower.userId, f.follower.profilePicture, f.follower.username,f.follower.bio,f.follower.isPrivate,true) " +
           "FROM Follows f WHERE f.following.userId = :userId")
    List<UserDto> findFollowersByUserId(@Param("userId") String userId);

    // Get followings of a user (people the user follows)
    @Query("SELECT new com.qt.backend.dto.UserDto(f.following.userId, f.following.profilePicture, f.following.username,f.following.bio,f.following.isPrivate) " +
           "FROM Follows f WHERE f.follower.userId = :userId")
    List<UserDto> findFollowingByUserId(@Param("userId") String userId);

    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END " +
           "FROM Follows f " +
           "WHERE f.follower.userId = :userId AND f.following.userId = :followingId")
    boolean findAnyFollowByUserIdAndFollowingId(@Param("userId") String userId, @Param("followingId") String followingId);

    @Query("SELECT COUNT(f) FROM Follows f WHERE f.following.userId = :userId")
    Long countFollowersByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(f) FROM Follows f WHERE f.follower.userId = :userId")
    Long countFollowingByUserId(@Param("userId") String userId);

    @Query("SELECT f.following.userId FROM Follows f WHERE f.follower.userId = :viewerId")
    List<String> findFollowingNamesByUserId(@Param("viewerId") String viewerId);

    @Query("SELECT f FROM Follows f WHERE f.follower.userId = :followerId AND f.following.userId = :followingId")
    Follows findByFollowerIdAndFollowingId(@Param("followerId") String followerId, @Param("followingId") String followingId);
}

