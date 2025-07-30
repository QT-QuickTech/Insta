import { useState } from 'react';
import { reelTags, reelLocations, reelData } from '../service/DB';
// For local testing - change this back to Railway URL after deploying CORS fix
// const API = 'http://localhost:8080/api/';
const API = 'https://insta-production-757a.up.railway.app/api/';

export let pageFeeds=0;
export let pageReels=0;
let user=null;
function setUser(newUser){
    user=newUser;
    localStorage.setItem('user', JSON.stringify(user));
}

export function getUser(){
    if(user==null){
        setUser(JSON.parse(localStorage.getItem('user')));
    }
    if(user==null){
        setLoggedInUser();
    }

    if(user==null){
        setUser({
            "userId": "mira_lennox",
            "profilePicture": "https://cdn.pixabay.com/photo/2021/03/02/16/34/woman-6063087_1280.jpg",
            "username": "Mira Lennox",
            "bio": "Photographer and tea collector.",
            "posts": 11,
        });
    }
    return user;
}
export  const setLoggedInUser=async()=>{
    const USER=API+`users/${getUser().userId}`;
    console.log('USER',USER);
    try{
        const response=await fetch(USER);
        const data=await response.json();
        console.log('user data',data);
        setUser(data);
        return data;
    }catch(error){  
        console.log('error',error);
    }
}
export  const getUserDetails=async(userId)=>{
    const USER=API+`users/${userId}?loggedInUserId=${getUser().userId}`;
    console.log('USER',USER);
    try{
        const response=await fetch(USER);
        const data=await response.json();
        console.log('user data',data);
        return data;
    }catch(error){  
        console.log('error',error);
    }
}
export const sentRequest=async(userId)=>{
    const SENT_REQUEST=API+`requests/create/${userId}?loggedInUserId=${getUser().userId}`;
    console.log('SENT_REQUEST',SENT_REQUEST);
    try{
        const response=await fetch(SENT_REQUEST, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            // body: JSON.stringify( { loggedInUserId: getUser().userId }),
        });
        const data=await response.json();
        console.log('sent request data',data);
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const acceptRequest=async(userId)=>{
    const ACCEPT_REQUEST=API+`requests/accept/${userId}?loggedInUserId=${getUser().userId}`;
    console.log('ACCEPT_REQUEST',ACCEPT_REQUEST);
    try{
        const response=await fetch(ACCEPT_REQUEST, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            // body: JSON.stringify( { loggedInUserId: getUser().userId }),
        }); 
        const data=await response.json();
        console.log('accept request data',data);
        user.followers=user.followers+1;
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const deleteRequest=async(userId)=>{
    const DELETE_REQUEST=API+`requests/delete/${userId}?loggedInUserId=${getUser().userId}`;
    console.log('DELETE_REQUEST',DELETE_REQUEST);
    try{
        const response=await fetch(DELETE_REQUEST, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            // body: JSON.stringify( { loggedInUserId: getUser().userId }),
        });
        const data=await response.json();
        console.log('delete request data',data);
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const cancelRequest=async(userId)=>{
    const CANCEL_REQUEST=API+`requests/cancel/${userId}?loggedInUserId=${getUser().userId}`;
    console.log('CANCEL_REQUEST',CANCEL_REQUEST);
    try{
        const response=await fetch(CANCEL_REQUEST, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            //  body: JSON.stringify( { loggedInUserId: getUser().userId }),
        });
        const data=await response.json();
        console.log('cancel request data',data);
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const viewStory=async(storyId)=>{
    const VIEW_STORY=API+`stories/${storyId}/view?loggedInUserId=${getUser().userId}`;
    console.log('VIEW_STORY',VIEW_STORY);
    try{
        const response=await fetch(VIEW_STORY , {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add auth headers here if needed
            },
            
          });
        const data=await response.json();
        console.log('view story data',data);
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const removeFollower=async(userId1,userId2)=>{
    const UNFOLLOW=API+`follows`;
    console.log('removeFollower',UNFOLLOW);
    try{    
        const response=await fetch(UNFOLLOW, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            body: JSON.stringify( { userId: userId2, loggedInUserId: userId1 }),
        });
        const data=await response.json();
        console.log('removeFollower data',data);
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const removeTag=async(postId)=>{
    const TAG=API+`tags/${postId}?loggedInUserId=${getUser().userId}`
    console.log('TAG',TAG);
    try{
        const response= await fetch(TAG, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              // Add auth headers here if needed
            },
            
          });
        const data=await response.json();
        console.log('removeTag',data.message);
        return data;
    }catch(error){
        console.log('error',error);
    }
}
// Function to set userId
export const deletePost=async(postId)=>{
     const POST=API+`posts/${postId}`
    console.log('POST',POST);
    try{
        const response= await fetch(POST, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              // Add auth headers here if needed
            },
            
          });
        const data=await response.json();
        console.log('deletpost',data);
        return data;
    }catch(error){
        console.log('error',error);
    }
}

export const login=async(userId,password)=>{
    const LOGIN=API+`users/login`;
    console.log('LOGIN',LOGIN);
    try{
        const response=await fetch(LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify( { userId: userId, password: password }),
        });
        
        if (!response.ok) {
            throw new Error(`Invalid username or password`);
        }
        
        const data=await response.json();
        setUser(data); 
        return data;
    }catch(error){
        console.log('error',error);
        return { error: error.message || 'Network error occurred' };
    }
}
    
export const setLike=async(postId)=>{
    const LIKE=API+`likes`;
    console.log('LIKE',LIKE);
    try{
        const response=await fetch(LIKE, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add auth headers here if needed
            },
            body: JSON.stringify( { postId: postId, userId: getUser().userId }),
          });
        const data=await response.json();
        console.log('like data',data);
      
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const setUnlike=async(postId)=>{
    const UNLIKE=API+`likes`;
    console.log('UNLIKE',UNLIKE);
    try{
        const response= await fetch(UNLIKE, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              // Add auth headers here if needed
            },
            body:  JSON.stringify(  { postId: postId, userId: getUser().userId }),
          });
        const data=await response.json();
        console.log('like data',data);
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const setComment=async(postId,comment)=>{
    const COMMENT=API+`comments`;
    console.log('COMMENT',COMMENT);
    try{
        const response=await fetch(COMMENT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            body: JSON.stringify( { postId: postId, userId: getUser().userId, commentText: comment }),
        });
        const data=await response.json();
        console.log('comment data',data); 
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const setSave=async(postId)=>{
    const SAVE=API+`saves`;
    console.log('SAVE',SAVE);
    try{
        const response=await fetch(SAVE, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            body: JSON.stringify( { postId: postId, userId: getUser().userId }),
        });
        const data=await response.json();
        console.log('save data',data); 
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const setUnsave=async(postId)=>{ 
    const UNSAVE=API+`saves`;
    console.log('UNSAVE',UNSAVE);
    try{
        const response=await fetch(UNSAVE, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            body: JSON.stringify( { postId: postId, userId: getUser().userId }),
        });
        const data=await response.json();
        console.log('save data',data);  
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const setFollow=async(userId2)=>{
    const FOLLOW=API+`follows`;
    console.log('FOLLOW',FOLLOW);
    try{
        const response=await fetch(FOLLOW, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            body: JSON.stringify( { userId: userId2, loggedInUserId: getUser().userId }),
        });
        const data=await response.json();
        console.log('follow data',data);
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const setUnfollow=async(userId2)=>{
    const UNFOLLOW=API+`follows`;
    console.log('UNFOLLOW',UNFOLLOW);
    try{    
        const response=await fetch(UNFOLLOW, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            body: JSON.stringify( { userId: userId2, loggedInUserId: getUser().userId }),
        });
        const data=await response.json();
        console.log('unfollow data',data);
        return data;
    }catch(error){
        console.log('error',error);
    }
}
export const getComments=async(postId)=>{
    const COMMENTS=API+`comments/${postId}`;
    console.log('COMMENTS',COMMENTS);
    try{
        const response=await fetch(COMMENTS);       
        const data=await response.json();
        console.log('comments data',data);
        return data;
    }catch(error){
        return error;
    }
}
export const getSuggections=async()=>{
    const suggestions=API+`users/${getUser().userId}/suggestions`;
    console.log('SUGGESTIONS',suggestions);
    try{
        const response=await fetch(suggestions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data=await response.json();
        console.log('suggestions data',data);
        return data;
    }catch(error){
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

export const getFollowers=async(userId)=>{
    const FOLLOWERS=API+`follows/followers/${userId}?loggedInUserId=${getUser().userId}`;
    console.log('FOLLOWERS',FOLLOWERS);
    try{
        const response=await fetch(FOLLOWERS);
        const data=await response.json();
        console.log('followers data',data);
        return data;
    }catch(error){
        return error;
    }
}
export const getFollowing=async(userId)=>{
    const FOLLOWING=API+`follows/following/${userId}?loggedInUserId=${getUser().userId}`;
    console.log('FOLLOWING',FOLLOWING);
    try{
        const response=await fetch(FOLLOWING);
        const data=await response.json();
        console.log('following data',data);
        return data;
    }catch(error){
       return error;
    }
}
export const getIsFollower=async(userId1)=>{
    const IS_FOLLOWER=API+`follows?user1=${userId1}&user2=${getUser().userId}`;
    console.log('IS_FOLLOWER',IS_FOLLOWER);
    try{
        const response=await fetch(IS_FOLLOWER);
        const data=await response.json();
        console.log('is follower data',data);
        return data;
    }catch(error){
        return error;
    }
}
export const getLikes=async(postId)=>{
    const LIKES=API+`likes/${postId}`;
    console.log('LIKES',LIKES);
    try{
        const response=await fetch(LIKES);
        const data=await response.json();
        console.log('likes data',data);
        return data;
    }catch(error){
        return error;
    }
}
export const getNotifications=async(page)=>{
    const NOTIFICATIONS=API+`notifications/${getUser().userId}?page=${page}`;
    console.log('NOTIFICATIONS',NOTIFICATIONS);
    try{
        const response=await fetch(NOTIFICATIONS);
        const data=await response.json();
        console.log('notifications data',data);
        return data;
    }catch(error){
        return error;
    }
}
export const getPosts=async(userId2)=>{
    const POSTS=API+`posts/${userId2}?loggedInUserId=${getUser().userId}`;
    console.log('POSTS',POSTS);

    try{
        const response=await fetch(POSTS);
        const data=await response.json();
        console.log('posts data',data);
        return data;
    }catch(error){
        return error;
    }
}
export const getPostsOfUser=async(userId,postId)=>{
    const POSTS_OF_USER=API+`posts/${userId}/${postId}`;
    console.log('POSTS_OF_USER',POSTS_OF_USER);
    try{
        const response=await fetch(POSTS_OF_USER);
        const data=await response.json();
        console.log('posts of user data',data);
        return data;
    }catch(error){
        return error;
    }
}
export const getFeeds=async(page)=>{
    const FEEDS=API+`posts/feeds/${getUser().userId}?page=${page}`;
    console.log('FEEDS',FEEDS);
    try{
        const response=await fetch(FEEDS);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data=await response.json();
        console.log('feeds data',data);
        // pageFeeds=page+1;
        return data;
    }catch(error){
        console.error('Error fetching feeds:', error);
        return [];
    }
}    
export const getReels = async (page) => {
    const REELS=API+`posts/reels/${getUser().userId}?page=${page}`;
    console.log('REELS',REELS);
    try{
        const response=await fetch(REELS);
        const data=await response.json();
        console.log('reels data',data);
        return data;
    }catch(error){
        return error;
    }
}

export const getSaves=async()=>{
    const SAVES=API+`saves/${getUser().userId}`;
    console.log('SAVES',SAVES);
    try{
        const response=await fetch(SAVES);
        const data=await response.json();
        console.log('saves data',data);
        return data;
    }catch(error){
        return error;
    }
}
export const getTags=async(userId)=>{
    const TAGS=API+`tags/${userId}`;
    console.log('TAGS',TAGS);
    try{
        const response=await fetch(TAGS);
        const data=await response.json();
        console.log('tags data',data);
        return data;
    }catch(error){
        return error;
    }
}
export const getSearch=async(query)=>{
    const SEARCH=API+`search/${query}?loggedInUserId=${getUser().userId}`;
    console.log('SEARCH',SEARCH);
    try{
        const response=await fetch(SEARCH);
        const data=await response.json();
        console.log('search data',data);
        return data;
    }catch(error){  
        return error;
    }
}
export const getViewers=async(storyId)=>{
    const VIEWERS=API+`stories/${storyId}/viewers?loggedInUserId=${getUser().userId}`;
    console.log('VIEWERS',VIEWERS);
    try{
        const response=await fetch(VIEWERS);
        const data=await response.json();
        console.log('viewers data',data);
        return data;
    }catch(error){
        return error;
    }
}
export const setStory=async(story)=>{
    const STORY=API+`stories`;
    console.log('STORY',STORY);
    try{
        const response=await fetch(STORY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            body: JSON.stringify(story),
        });
        const data=await response.json(); 
        console.log('story data',data);
        
        return data;
    }catch(error){
        return error;
    }
}
export const getStories=async()=>{
    const STORIES=API+`stories/${getUser().userId}`;
    console.log('STORIES',STORIES);
    try{
        const response=await fetch(STORIES);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data=await response.json();
        console.log('stories data',data);
        return data;
    }catch(error){
        console.error('Error fetching stories:', error);
        return [];
    }
};

export async function postApi(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add auth headers here if needed
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
}

export async function deleteApi(url, body) {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // Add auth headers here if needed
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // No content
  }
  return data;
}
export const setPost=async(post)=>{
    const POST=API+`posts`;
    console.log('POST',POST);
    try{
        const response=await fetch(POST, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add auth headers here if needed
            },
            body: JSON.stringify(post),
        }); 
        const data=await response.json();
        console.log('post data',data);
        return data;
    }catch(error){
        return error;
    }
}

export async function cloudUpload(fileOrBlob, fileType = "auto") {
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/df0wephst/${fileType}/upload`;
  const CLOUDINARY_UPLOAD_PRESET = "quick_teck";
  const formData = new FormData();
  formData.append("file", fileOrBlob);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (data.secure_url) {
    return data.secure_url;
  } else {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }
}

export const registerUser = async (user) => {
  const REGISTER = API + 'users/register';
  console.log(user);
  try {
    const response = await fetch(REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
   
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('registerUser error', error);
    throw error;
  }
};