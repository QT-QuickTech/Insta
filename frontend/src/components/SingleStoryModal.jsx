import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultProfilePicture from '../images/profile.webp';
import defaultVideo from '../images/mockVideo.mp4';
import defaultImage from '../images/mockImage.jpg';
import { getViewers } from '../service/Api';

export default function SingleStoryModal({ story, onClose, onStoryViewed }) {
  const navigate = useNavigate();
  if (!story) return null;
  const [storyViewers, setStoryViewers] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const imageViewTimeout = useRef(null);
  const [showViewedStories, setShowViewedStories] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const startTimeRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const showViewedStoriesRef = useRef(false);
  const totalPausedTimeRef = useRef(0);

  const IMAGE_DURATION = 10; // seconds for images
  const VIDEO_DURATION = 15; // seconds for videos

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  useEffect(()=>{
    if (story.storyId) {
      setLoadingViewers(true);
      getViewers(story.storyId).then(data=>{
        if (Array.isArray(data)) {
          setStoryViewers(data.filter(user=>user.userId!=story.userId).reverse());
        } else {
          console.error('Invalid data received from getViewers:', data);
          setStoryViewers([]);
        }
        setLoadingViewers(false);
      }).catch(error => {
        console.error('Error fetching viewers:', error);
        setStoryViewers([]);
        setLoadingViewers(false);
      });
    }
  },[story.storyId]);

  // Helper to close modal
  const handleClose = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    onClose();
  };

  const handleUserClick = (userId, userObj) => {
    if (window.location.pathname === `/user/${userId}`) {
      navigate('/', { replace: true });
      setTimeout(() => {
        navigate(`/user/${userId}`, { replace: true, state: { user: userObj } });
        window.dispatchEvent(new Event('forceSidebarReset'));
      }, 0);
    } else {
      navigate(`/user/${userId}`, { state: { user: userObj } });
    }
  };

  const toggleViewedStories = () => {
    const newShowState = !showViewedStories;
    setShowViewedStories(newShowState);
    showViewedStoriesRef.current = newShowState;
    
    if (newShowState) {
      // Pause story when opening viewed stories tab
      if (story.mediaType === 'video') {
        const video = videoRef.current;
        if (video && !video.paused) {
          video.pause();
        }
      } else if (story.mediaType === 'image') {
        // For images, track when we paused
        setPauseStartTime(Date.now());
      }
    } else {
      // Resume story when closing viewed stories tab
      if (story.mediaType === 'video') {
        const video = videoRef.current;
        if (video && video.paused) {
          video.play();
        }
      } else if (story.mediaType === 'image') {
        // For images, calculate total paused time
        if (pauseStartTime) {
          const pausedDuration = Date.now() - pauseStartTime;
          const newTotalPausedTime = totalPausedTime + pausedDuration;
          setTotalPausedTime(newTotalPausedTime);
          totalPausedTimeRef.current = newTotalPausedTime;
          setPauseStartTime(null);
        }
      }
    }
  };

  // Initialize story when it changes
  useEffect(() => {
    setProgress(0);
    setVideoError(false);
    setTotalPausedTime(0);
    totalPausedTimeRef.current = 0;
    setPauseStartTime(null);
    startTimeRef.current = Date.now();
    
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (story.mediaType === 'image') {
      // Start progress interval for images
      progressIntervalRef.current = setInterval(() => {
        // Use ref values that are always current
        if (showViewedStoriesRef.current) return; // Pause when tab is open
        
        const elapsed = (Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000;
        const percent = Math.min((elapsed / IMAGE_DURATION) * 100, 100);
        setProgress(percent);
        
        if (percent >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          handleClose();
        }
      }, 50);
    }
  }, [story.mediaType]);

  // Handle video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video || story.mediaType !== 'video') return;

    const updateProgress = () => {
      if (showViewedStories) return; // Pause when tab is open
      
      const effectiveDuration = video.duration ? Math.min(video.duration, VIDEO_DURATION) : VIDEO_DURATION;
      setProgress((video.currentTime / effectiveDuration) * 100);
      
      if (video.currentTime >= effectiveDuration) {
        handleClose();
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration > VIDEO_DURATION) {
        video.currentTime = 0;
      }
    };

    const handlePlay = () => setIsPaused(false);
    const handlePause = () => setIsPaused(true);
    const handleEnded = () => handleClose();

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    setIsPaused(video.paused);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [story.mediaType, showViewedStories]);

  // Mark as viewed and auto-advance for images
  useEffect(() => {
    let advanceTimeout;
    
    if (story.mediaType === 'image') {
      if (!story.viewed && onStoryViewed) {
        imageViewTimeout.current = setTimeout(() => {
          onStoryViewed();
        }, 1000);
      }
      
      // Auto-advance after IMAGE_DURATION seconds, but pause when viewed stories tab is open
      if (!showViewedStories) {
        advanceTimeout = setTimeout(() => {
          handleClose();
        }, IMAGE_DURATION * 1000);
      }
    }
    
    return () => {
      if (imageViewTimeout.current) {
        clearTimeout(imageViewTimeout.current);
        imageViewTimeout.current = null;
      }
      if (advanceTimeout) {
        clearTimeout(advanceTimeout);
      }
    };
  }, [story, onStoryViewed, showViewedStories]);

  // Toggle play/pause on click for videos
  const handleStoryClick = () => {
    const video = videoRef.current;
    if (!video || story.mediaType !== 'video') return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
      {/* Close button top right */}
      <button
        onClick={handleClose}
        className="fixed top-6 right-8 z-50 text-white text-4xl hover:text-gray-300 focus:outline-none"
        aria-label="Close"
      >
        &times;
      </button>
      
      {/* Main story card centered */}
      <div className="relative flex flex-col w-[380px] md:w-[420px] h-[100vh] bg-black rounded-2xl shadow-2xl overflow-hidden z-20 mx-auto">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 px-4 pt-4 z-20">
          <div className="h-1 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Top bar: avatar, username, time */}
        <div className="absolute top-10 left-0 right-0 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-3">
            <img 
              src={story.profilePicture || defaultProfilePicture} 
              alt={story.userId} 
              className="w-9 h-9 rounded-full border-2 border-white" 
              onError={e => e.target.src = defaultProfilePicture} 
            />
            <span className="text-white font-semibold text-base">{story.userId}</span>
            <span className="text-gray-300 text-xs ml-2">{story.createdAt || '1h'}</span>
          </div>
        </div>

        {/* Story media */}
        <div 
          className="flex-1 flex items-center justify-center bg-black" 
          onClick={story.mediaType === 'video' ? handleStoryClick : undefined} 
          style={{ cursor: story.mediaType === 'video' ? 'pointer' : 'default', minHeight: '60vh', minWidth: '100%' }}
        >
          {story.mediaType === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {!videoError ? (
                <video
                  ref={videoRef}
                  src={story.storyUrl || defaultVideo}
                  playsInline
                  autoPlay
                  loop={false}
                  className="max-h-[60vh] max-w-full w-full h-full object-contain bg-black rounded-xl shadow-lg"
                  onError={(e) => {
                    console.error('Video error:', e);
                    console.error('Video URL:', story.storyUrl);
                    setVideoError(true);
                  }}
                  onLoadStart={() => {
                    console.log('Video loading started:', story.storyUrl);
                    setVideoError(false);
                  }}
                  onCanPlay={() => {
                    console.log('Video can play:', story.storyUrl);
                    setVideoError(false);A
                  }}
                  onPlay={() => {
                    if (!story.viewed && onStoryViewed) {
                      onStoryViewed();
                    }
                  }}
                />
              ) : (
                <div 
                  className="flex flex-col items-center justify-center text-white cursor-pointer"
                  onClick={handleClose}
                >
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="mb-4">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <p className="text-lg">Video unavailable</p>
                  <p className="text-sm text-gray-400 mt-2">Click to continue</p>
                </div>
              )}
              {isPaused && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="white" className="opacity-80">
                    <polygon points="8,5 19,12 8,19" />
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <img
              src={story.storyUrl || defaultImage}
              alt="story"
              className="max-h-[60vh] max-w-full w-full h-full object-contain bg-black rounded-xl shadow-lg"
              onError={e => e.target.src = defaultImage}
            />
          )}
        </div>
        
                 {/* Viewed Stories Button */}
         <div className="flex items-center justify-center px-4 py-3 bg-black/80 border-t border-gray-800">
           <button 
             onClick={toggleViewedStories}
             className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
           >
             <i className="bi bi-chevron-compact-up text-xl"></i>
             <span>Viewers </span>
           </button>
         </div>
      </div>

      {/* Sliding Tab for Viewed Stories */}
      <div 
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 w-[380px] md:w-[420px] bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out ${
          showViewedStories ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70vh' }}
      >
                 {/* Header */}
         <div className="flex items-center justify-between p-4 border-b border-gray-200"  onClick={toggleViewedStories}>
           <h3 className="text-lg font-semibold text-gray-800">Viewers</h3>
           <button 
            
             className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-transform duration-200 hover:scale-110"
           >
             <i className="bi bi-chevron-compact-down"></i>
           </button>
         </div>
        
                 {/* Scrollable List */}
         <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
           {loadingViewers ? (
            <div className="flex justify-center items-center h-32">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
          ) : (
            storyViewers.map((user, index) => (
              <div key={user.userId || index} className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50" onClick={()=>handleUserClick(user.userId,user)}>
                <div className="relative">
                  <img 
                    src={user.profilePicture} 
                    alt={user.userId} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    onError={e => e.target.src = defaultProfilePicture}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{user.username || user.userId}</span>
                    <span className="text-xs text-gray-500">
                      {user.viewedAt ? formatTimeAgo(new Date(user.viewedAt)) : 'Recently'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 