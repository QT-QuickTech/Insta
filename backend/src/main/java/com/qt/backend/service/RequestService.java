package com.qt.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.qt.backend.model.Notification;
import com.qt.backend.model.Request;
import com.qt.backend.repo.NotificationRepository;
import com.qt.backend.repo.RequestRepository;
import com.qt.backend.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RequestService {
    private final RequestRepository requestRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final FollowsService followService;

    public void createRequest(String userId, String loggedInUserId) {
        try{
            Optional<Request> existingRequest = requestRepository.findByUserAndByUser(userId, loggedInUserId);
            System.out.println("existingRequest: " + existingRequest);
            if(existingRequest.isPresent()){
                existingRequest.get().setCreatedAt(LocalDateTime.now());
                requestRepository.save(existingRequest.get());
             
            }else{   
                Request request = new Request();
                request.setUser(userId);
                request.setByUser(loggedInUserId);
                request.setCreatedAt(LocalDateTime.now());
                requestRepository.save(request);
            }
            Notification existingNotification = notificationRepository.findByUserIdAndByUserIdWhereText(userId, loggedInUserId);
            if(existingNotification != null){
                existingNotification.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(existingNotification);
            }
            else{
                Notification notification = new Notification();
                notification.setUser(userRepository.findById(userId).get());
                notification.setByUser(userRepository.findById(loggedInUserId).get());
                notification.setText("Requested you to accept");
                notification.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void acceptRequest(String userId, String loggedInUserId) {
        try{
            Optional<Request> existingRequest = requestRepository.findByUserAndByUser( loggedInUserId,userId);
            if(existingRequest.isPresent()){
                requestRepository.delete(existingRequest.get());
                followService.followUser(loggedInUserId,userId);

                    Notification notification = new Notification();
                    notification.setUser(userRepository.findById(userId).get());
                    notification.setByUser(userRepository.findById(loggedInUserId).get());
                    notification.setText("Accepted your request");
                    notification.setCreatedAt(LocalDateTime.now());
                    notificationRepository.save(notification);
                    Notification existingNotification = notificationRepository.findByUserIdAndByUserIdWhereText(loggedInUserId, userId);
                    if(existingNotification != null){
                        notificationRepository.delete(existingNotification);
                    }
                
            }
        } catch (Exception e) {
            throw new RuntimeException("no request found");
        }
    }

    public void deleteRequest(String userId, String loggedInUserId) {
        try{
            Optional<Request> existingRequest = requestRepository.findByUserAndByUser( loggedInUserId,userId);
            if(existingRequest.isPresent()){
                requestRepository.delete(existingRequest.get());
                Notification existingNotification = notificationRepository.findByUserIdAndByUserIdWhereText(loggedInUserId, userId);
                if(existingNotification != null){
                    notificationRepository.delete(existingNotification);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("no request found");
        }
    }

   
}
