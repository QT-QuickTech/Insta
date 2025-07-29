package com.qt.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

import com.qt.backend.dto.StoryDto;
import com.qt.backend.dto.StoryRequest;
import com.qt.backend.dto.UserDto;
import com.qt.backend.model.Story;
import com.qt.backend.model.StoryView;
import com.qt.backend.model.User;
import com.qt.backend.repo.FollowsRepository;
import com.qt.backend.repo.PostRepository;
import com.qt.backend.repo.RequestRepository;
import com.qt.backend.repo.StoryRepository;
import com.qt.backend.repo.StoryViewRepository;
import com.qt.backend.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StoryService {
    private final StoryRepository storyRepository;
    private final FollowsRepository followsRepository;
    private final UserRepository userRepository;
    private final StoryViewRepository storyViewRepository;
    private final FollowsService followsService;
    private final PostRepository postRepository;
    private final RequestRepository requestRepository;

    public List<StoryDto> getStoryByUserId(String viewerId) {
        List<String> userIds = followsRepository.findFollowingNamesByUserId(viewerId);
        userIds.add(viewerId);
        return storyRepository.findByUserIdInWithViewStatus(userIds, viewerId);
    }

    public void viewStory(Long storyId, String userId) {
       Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
       StoryView storyView = new StoryView();
       storyView.setStory(story);
       storyView.setUser(userRepository.findByUserId(userId));
       storyViewRepository.save(storyView);
    }

    public void createStory(String userId, StoryRequest storyRequest) {
        User user = userRepository.findByUserId(userId);
        if(user == null) {
            throw new RuntimeException("User not found");
        }
        Story existingStory = storyRepository.findByUserId(userId);
        if(existingStory != null) {
             storyRepository.delete(existingStory);
        }
        Story story = new Story();
        story.setStoryUrl(storyRequest.getStoryUrl());
        story.setStoryType(storyRequest.getStoryType());
        story.setCaption(storyRequest.getCaption());
        story.setUser(user);
        storyRepository.save(story);
    }

    public List<UserDto> getStoryViewers(Long storyId, String loggedInUserId) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        List<UserDto> storyViews = storyViewRepository.findByStory(story);
        for(UserDto user : storyViews) {
            user.setIsFollowed(followsService.isFollowing(loggedInUserId, user.getUserId()));
            user.setPosts(postRepository.countPostsByUserId(user.getUserId()));
            user.setFollowers(followsRepository.countFollowersByUserId(user.getUserId()));
            user.setFollowing(followsRepository.countFollowingByUserId(user.getUserId()));
            if(!user.isFollowed() && user.isPrivate()){
                user.setIsRequested(requestRepository.findByUserAndByUser(user.getUserId(), loggedInUserId).isPresent());
            }else{
                user.setIsRequested(false);
            }
        }
        return storyViews;
    }
}
