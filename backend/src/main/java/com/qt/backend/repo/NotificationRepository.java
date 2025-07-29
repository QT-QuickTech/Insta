package com.qt.backend.repo;


import com.qt.backend.dto.NotificationDto;
import com.qt.backend.model.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT new com.qt.backend.dto.NotificationDto(n.id, n.byUser.profilePicture , n.byUser.userId, n.byUser.username,n.byUser.bio,n.byUser.isPrivate, n.text, n.createdAt) "
    + "FROM Notification n "
    + "WHERE n.user.userId = :userId ORDER BY n.createdAt DESC")
    Page<NotificationDto> findByUser(String userId, Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.user.userId = :userId AND n.byUser.userId = :byUserId")
    Notification findByUserIdAndByUserId(String userId, String byUserId);

    @Query("SELECT n FROM Notification n WHERE n.user.userId = :userId AND n.byUser.userId = :loggedInUserId AND n.text LIKE '%Requested%'")
    Notification findByUserIdAndByUserIdWhereText(String userId, String loggedInUserId);


}
