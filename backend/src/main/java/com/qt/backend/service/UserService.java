package com.qt.backend.service;

import com.qt.backend.dto.UserDto;
import com.qt.backend.dto.UserPasswordCheckDto;
import com.qt.backend.dto.UserRequest;
import com.qt.backend.model.User;
import com.qt.backend.repo.FollowsRepository;
import com.qt.backend.repo.PostRepository;
import com.qt.backend.repo.UserRepository;
import com.qt.backend.repo.RequestRepository;

import java.util.List;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowsRepository followsRepository;
    private final PostRepository postRepository;
    private final RequestRepository requestRepository;

    public UserDto getUserById(String userId) {
        UserDto user = userRepository.findUserDtoByUserId(userId);
        user.setIsFollowed(true);
        user.setPosts(postRepository.countPostsByUserId(userId));
        user.setFollowers(followsRepository.countFollowersByUserId(userId));
        user.setFollowing(followsRepository.countFollowingByUserId(userId));
        user.setIsRequested(false);
        return user;
    }
  

    public UserDto checkPassword(UserPasswordCheckDto userPasswordCheckDto) {

        UserDto user = userRepository.findByUserIdAndPassword(userPasswordCheckDto.getUserId(), userPasswordCheckDto.getPassword());
        if(user == null)
            return null;
        else{
            user.setIsFollowed(true);
            user.setPosts(postRepository.countPostsByUserId(user.getUserId()));
            user.setFollowers(followsRepository.countFollowersByUserId(user.getUserId()));
            user.setFollowing(followsRepository.countFollowingByUserId(user.getUserId()));
            user.setIsRequested(false);
        }
        return user;

    }

    

    public List<UserDto> getUserSuggestions(String userId) {
        List<UserDto> users = userRepository.findUsersNotFollowedBy(userId, PageRequest.of(0, 10));
        // for(UserDto user:users){
        //     user.setIsFollowed(false);
        //     user.setPosts(postRepository.countPostsByUserId(user.getUserId()));
        //     user.setFollowers(followsRepository.countFollowersByUserId(user.getUserId()));
        //     user.setFollowing(followsRepository.countFollowingByUserId(user.getUserId()));
        //     if(!user.isFollowed() && user.isPrivate()){
        //         user.setIsRequested(requestRepository.findByUserAndByUser(user.getUserId(), userId).isPresent());
        //     }else{
        //         user.setIsRequested(false);
        //     }
        // }
        return users;
    }


    public UserDto registerUser(UserRequest userRequest) {
        if(userRepository.findByUserId(userRequest.getUserId())!=null){
            throw new RuntimeException("UserId already exists");
        }
        User user = new User();
        user.setUserId(userRequest.getUserId());
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        user.setPassword(userRequest.getPassword());
        user.setBio(userRequest.getBio());
        user.setProfilePicture(userRequest.getProfilePicture());
        user.setIsPrivate(userRequest.isPrivate());
        userRepository.save(user);
        return userRepository.findUserDtoByUserId(userRequest.getUserId());
    }

}
