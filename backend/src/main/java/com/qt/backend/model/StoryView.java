package com.qt.backend.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="story_views")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoryView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "story_view_id", nullable = false)
    private Long storyViewId;

    @ManyToOne
    @JoinColumn(name = "story_id")
    @JsonIgnore
    private Story story;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
