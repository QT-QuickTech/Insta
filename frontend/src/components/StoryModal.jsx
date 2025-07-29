import React, { useState, useRef, useEffect } from 'react';
import { getUser } from '../service/Api';
import defaultProfilePicture from '../images/profile.webp';
import defaultVideo from '../images/mockVideo.mp4';
import defaultImage from '../images/mockImage.jpg';

export default function StoryModal({ stories, initialIndex = 0, onClose, onStoryViewed, setUserStoryViewed }) {
  const loggedInUser = getUser();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const imageViewTimeout = useRef(null);

  const currentStory = stories[currentIndex]; // Move this up before useEffects

  const IMAGE_DURATION = 10; // seconds for images
  const VIDEO_DURATION = 15; // seconds for videos

  // Mark current story as viewed and notify parent (moved to onPlay/onImageView)
  // useEffect(() => {
  //   if (currentStory?.viewed) return;
  //   if (onStoryViewed && currentStory?._originalIndex !== undefined) {
  //     onStoryViewed(currentStory._originalIndex); // Use the original index!
  //   }
  // }, [currentIndex, onStoryViewed, stories, currentStory]);

  // Helper to go to next story or close
  const goToNextOrClose = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    setProgress(0);
    setVideoError(false);
    const video = videoRef.current;
    let imageProgressInterval;
    if (currentStory.mediaType === 'image') {
      // Animate progress bar for image over IMAGE_DURATION seconds
      const start = Date.now();
      imageProgressInterval = setInterval(() => {
        const elapsed = (Date.now() - start) / 1000;
        const percent = Math.min((elapsed / IMAGE_DURATION) * 100, 100);
        setProgress(percent);
        if (percent >= 100) {
          clearInterval(imageProgressInterval);
        }
      }, 50);
    } else if (video) {
      let effectiveDuration = VIDEO_DURATION;
      const updateProgress = () => {
        // Use the actual video duration if less than VIDEO_DURATION
        effectiveDuration = video.duration ? Math.min(video.duration, VIDEO_DURATION) : VIDEO_DURATION;
        setProgress((video.currentTime / effectiveDuration) * 100);
        if (video.currentTime >= effectiveDuration) {
          goToNextOrClose();
        }
      };
      video.addEventListener('timeupdate', updateProgress);
      // Seek to 0 if video is longer than VIDEO_DURATION
      const handleLoadedMetadata = () => {
        if (video.duration > VIDEO_DURATION) {
          video.currentTime = 0;
        }
      };
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      // Listen for play/pause events
      const handlePlay = () => setIsPaused(false);
      const handlePause = () => setIsPaused(true);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      setIsPaused(video.paused);
      return () => {
        video.removeEventListener('timeupdate', updateProgress);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
    return () => {
      if (imageProgressInterval) clearInterval(imageProgressInterval);
    };
  }, [currentIndex, stories.length, onClose, currentStory.mediaType]);

  useEffect(() => {
    const video = videoRef.current;
    const handleEnded = () => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    };
    video?.addEventListener('ended', handleEnded);
    return () => video?.removeEventListener('ended', handleEnded);
  }, [currentIndex, stories.length, onClose]);

  // Mark as viewed for images after 1s, and auto-advance after IMAGE_DURATION
  useEffect(() => {
    let advanceTimeout;
    // Always auto-advance after IMAGE_DURATION, regardless of viewed status
    if (currentStory.mediaType === 'image') {
      if (!currentStory.viewed) {
        imageViewTimeout.current = setTimeout(() => {
          if (currentStory.userId === loggedInUser.userId) {
            setUserStoryViewed();
          }else if (onStoryViewed && currentStory._originalIndex !== undefined) {
            onStoryViewed(currentStory._originalIndex);
          }
         
        }, 1000);
      }
      // Auto-advance after IMAGE_DURATION seconds
      advanceTimeout = setTimeout(() => {
        goToNextOrClose();
      }, IMAGE_DURATION * 1000);
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
  }, [currentIndex, currentStory, onStoryViewed, stories.length, onClose]);

  const handleNext = (e) => {
    e?.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Carousel: get prev/next stories for side cards
  const getSideStory = (offset) => {
    const idx = currentIndex + offset;
    if (idx < 0 || idx >= stories.length) return null;
    return stories[idx];
  };
  const prevStory = getSideStory(-1);
  const nextStory = getSideStory(1);

  // Toggle play/pause on click
  const handleStoryClick = () => {
    const video = videoRef.current;
    if (!video) return;
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
        onClick={onClose}
        className="fixed top-6 right-8 z-50 text-white text-4xl hover:text-gray-300 focus:outline-none"
        aria-label="Close"
      >
        &times;
      </button>
      {/* Previous nav arrow at far left */}
      {currentIndex > 0 && (
        <button
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-black/40 hover:bg-black/60 rounded-full p-2 m-4"
          onClick={handlePrev}
          aria-label="Previous story"
        >
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {/* Next nav arrow at far right */}
      {currentIndex < stories.length - 1 && (
        <button
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-black/40 hover:bg-black/60 rounded-full p-2 m-4"
          onClick={handleNext}
          aria-label="Next story"
        >
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
      {/* Carousel container */}
      <div className="flex items-center justify-center w-full h-full">
        {/* Previous story card or empty space */}
        {prevStory ? (
          <div className="hidden md:flex mx-28 flex-col items-center justify-center w-56 h-[70vh] rounded-2xl bg-black/60 shadow-lg scale-90 cursor-pointer transition-all duration-200 relative" onClick={handlePrev}>
            {/* Media */}
            {prevStory.mediaType === 'video' ? (
              <video src={prevStory.storyUrl || defaultVideo} className="max-h-[60vh] max-w-full w-full h-full object-contain bg-black rounded-xl shadow-lg mt-2 blur-[1.5px] opacity-60" muted />
            ) : (
              <img src={prevStory.storyUrl || defaultImage} alt="prev story" className="max-h-[60vh] max-w-full w-full h-full object-contain bg-black rounded-xl shadow-lg mt-2 blur-[1.5px] opacity-60" onError={e => e.target.src = defaultImage} />
            )}
            {/* Overlay avatar */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className={`p-1 w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-1 ${prevStory.viewed ? 'border-2 border-white bg-slate-200' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'}`}> 
                <img
                  src={prevStory.profilePicture || defaultProfilePicture}
                  alt={prevStory.userId}
                  className="w-full h-full rounded-full border-2 border-white object-cover"
                  onError={e => e.target.src = defaultProfilePicture}
                />
              </div>
            </div>
            {/* Name at bottom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-center w-full text-lg font-semibold drop-shadow-lg">
              {prevStory.userId}
            </div>
          </div>
        ) : (
          <div className="hidden md:block w-56 mx-28 h-[70vh]" />
        )}
        {/* Main story card always centered */}
        <div className="relative flex flex-col w-[380px] md:w-[420px] h-[100vh] bg-black rounded-2xl shadow-2xl overflow-hidden z-20 mx-auto">
          {/* Progress bars */}
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
              <img src={currentStory.profilePicture || defaultProfilePicture} alt={currentStory.userId} className="w-9 h-9 rounded-full border-2 border-white" onError={e => e.target.src = defaultProfilePicture} />
              <span className="text-white font-semibold text-base">{currentStory.userId}</span>
              <span className="text-gray-300 text-xs ml-2">{currentStory.createdAt || '1h'}</span>
            </div>
          </div>

          {/* Story media */}
          <div className="flex-1 flex items-center justify-center bg-black" onClick={currentStory.mediaType === 'video' ? handleStoryClick : undefined} style={{ cursor: currentStory.mediaType === 'video' ? 'pointer' : 'default', minHeight: '60vh', minWidth: '100%' }}>
            {currentStory.mediaType === 'video' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {!videoError ? (
                  <video
                    ref={videoRef}
                    src={currentStory.storyUrl || defaultVideo}
                    playsInline
                    autoPlay
                    loop={false}
                    className="max-h-[60vh] max-w-full w-full h-full object-contain bg-black rounded-xl shadow-lg"
                    onError={(e) => {
                      console.error('Video error:', e);
                      console.error('Video URL:', currentStory.storyUrl);
                      setVideoError(true);
                    }}
                    onLoadStart={() => {
                      console.log('Video loading started:', currentStory.storyUrl);
                      setVideoError(false);
                    }}
                    onCanPlay={() => {
                      console.log('Video can play:', currentStory.storyUrl);
                      setVideoError(false);
                    }}
                    onPlay={() => {
                      if (currentStory.userId === loggedInUser.userId) {
                        setUserStoryViewed();
                      }else if (!currentStory.viewed && onStoryViewed && currentStory._originalIndex !== undefined) {
                        onStoryViewed(currentStory._originalIndex);
                      }
                    }}
                  />
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center text-white cursor-pointer"
                    onClick={handleNext}
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
                src={currentStory.storyUrl || defaultImage}
                alt="story"
                className="max-h-[60vh] max-w-full w-full h-full object-contain bg-black rounded-xl shadow-lg"
              />
            )}
          </div>
          {/* Reply input at bottom */}
          {/* <form className="flex items-center gap-2 px-4 py-3 bg-black/80 border-t border-gray-800">
            <input type="text" className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 py-1" placeholder={`Reply to ${currentStory.userId}...`} />
            <button type="submit" className="text-blue-500 font-semibold">Send</button>
          </form> */}
        </div>
        {/* Next story card or empty space */}
        {nextStory ? (
          <div className="hidden md:flex flex-col items-center justify-center w-56 h-[70vh] rounded-2xl bg-black/60 shadow-lg scale-90 cursor-pointer transition-all duration-200 mx-28 relative" onClick={handleNext}>
            {/* Media */}
            {nextStory.mediaType === 'video' ? (
              <video src={nextStory.storyUrl || defaultVideo} className="max-h-[60vh] max-w-full w-full h-full object-contain bg-black rounded-xl shadow-lg mt-2 blur-[1.5px] opacity-60" muted />
            ) : (
              <img src={nextStory.storyUrl || defaultImage} alt="next story" className="max-h-[60vh] max-w-full w-full h-full object-contain bg-black rounded-xl shadow-lg mt-2 blur-[1.5px] opacity-60" onError={e => e.target.src = defaultImage} />
            )}
            {/* Overlay avatar */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className={`p-1 w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-1 ${nextStory.viewed ? 'border-2 border-white bg-slate-200' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'}`}> 
                <img
                  src={nextStory.profilePicture || defaultProfilePicture}
                  alt={nextStory.userId}
                  className="w-full h-full rounded-full border-2 border-white object-cover"
                  onError={e => e.target.src = defaultProfilePicture}
                />
              </div>
            </div>
            {/* Name at bottom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-center w-full text-lg font-semibold drop-shadow-lg">
              {nextStory.userId}
            </div>
          </div>
        ) : (
          <div className="hidden md:block w-56 mx-28 h-[70vh]" />
        )}
      </div>
    </div>
  );
} 