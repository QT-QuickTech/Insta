package com.qt.backend.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.qt.backend.model.Request;

public interface RequestRepository extends JpaRepository<Request, Long> {
    @Query("SELECT r FROM Request r WHERE r.user = :user AND r.byUser = :byUser")
    Optional<Request> findByUserAndByUser(String user, String byUser);
}
