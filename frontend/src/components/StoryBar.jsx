import React, { useRef, useState, useEffect } from 'react';
import { getStories } from '../service/Api';
import { stories as storiesDB } from '../service/DB';
import { viewStory } from '../service/Api';
import { getUser } from '../service/Api';
import StoryModal from './StoryModal';
import defaultProfilePicture from '../images/Profile.webp'; 
import StoryUpload from './StoryUpload';
import SingleStoryModal from './SingleStoryModal';

export default function StoryBar() {
  const scrollRef = useRef(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyModalIndex, setStoryModalIndex] = useState(0);
  const [sortedStoriesForModal, setSortedStoriesForModal] = useState([]);
  const [userStory, setUserStory] = useState(null);
  const loggedInUser = getUser();
  const [showStoryUpload, setShowStoryUpload] = React.useState(false);
  const [showSingleStoryModal, setShowSingleStoryModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    setLoading(true);
    getStories().then(data => {
      const userStory = data.find(story => story.userId === loggedInUser.userId)
      setUserStory(userStory ? {
        ...userStory,
        mediaType: userStory.storyType || 'video',
        _originalIndex: 0,
      } : null);
      setStories(userStory ? data.filter(story => story.userId !== loggedInUser.userId) : data);
      setLoading(false);
    }).catch(() => {
      setStories(storiesDB);
      setLoading(false);
    });
  }, []);

  // const loggedInUser = getUser();

  // Helper to get sorted stories as displayed
  const getSortedStories = () => {
    return stories
      .map((story, idx) => ({
        ...story,
        _originalIndex: idx,
        mediaType: story.storyType || 'video',
      }))
      .sort((a, b) => (a.viewed === b.viewed ? a._originalIndex - b._originalIndex : a.viewed - b.viewed));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
      setIsOverflowing(el.scrollWidth > el.clientWidth + 1);
    };
    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    const timeoutId = setTimeout(update, 100);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      clearTimeout(timeoutId);
    };
  }, [stories, loading]);

  // Mark story as viewed
  const handleStoryViewed = (originalIndex) => {
    setStories((prev) => {
      if (prev[originalIndex]?.viewed) return prev;
      const updated = [...prev];
      updated[originalIndex] = { ...updated[originalIndex], viewed: true };
      viewStory(updated[originalIndex].storyId);
      return updated;
    });
    setSortedStoriesForModal((prev) => {
      if (!prev.length) return prev;
      return prev.map(story =>
        story._originalIndex === originalIndex ? { ...story, viewed: true } : story
      );
    });
   
  };
  const setUserStoryViewed=() => {
    if (userStory && !userStory.viewed) {
    viewStory(userStory.storyId);
    setUserStory((prev) => {
      if (!prev) return prev;
      return { ...prev, viewed: true };
    });
    }
  };

  return (
    <>
      <div className="relative bg-white w-full h-32 overflow-hidden flex items-center pl-2 pr-1">
        {isOverflowing && canScrollLeft && (
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full  p-1"
            onClick={() => scrollRef.current.scrollBy({ left: -262, behavior: 'smooth' })}
            type="button"
          >
            <i className="fa-solid fa-circle-chevron-left text-2xl text-white"></i>
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex items-center h-full overflow-x-auto scroll-smooth no-scrollbar   w-full"
        >
          {/* Your Story (first item) */}
          {!loading &&
           <div className="flex flex-col justify-center items-center min-w-[95px] mr-2">
            <div className="relative w-24 h-24 mb-1 flex items-center justify-center">
              <div
                className={`p-[4px] w-24 h-24 rounded-full overflow-hidden flex items-center justify-center ${userStory ? (userStory.viewed ? 'border-2 border-white bg-slate-200' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600') : 'bg-gradient-to-tr from-blue-400 to-blue-600'} cursor-pointer group`}
                onClick={() => {
                  if (userStory) {
                    setSelectedStory(userStory);
                    setShowSingleStoryModal(true);
                  } else {
                    setShowStoryUpload(true);
                  }
                }}
              >
                <img
                  src={userStory ? userStory.profilePicture : loggedInUser.profilePicture || defaultProfilePicture} onError={e => e.target.src = defaultProfilePicture}
                  alt={loggedInUser.userId}
                  className="object-cover w-full h-full rounded-full border-2 border-white"
                />
              </div>
              {/* Blue plus icon overlay always visible, clickable for add/update */}
              <span
                className="absolute bottom-1 right-1 bg-white border-1 border-white text-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-xl z-10 shadow"
                onClick={e => {
                  e.stopPropagation();
                  setShowStoryUpload(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-plus-circle-fill"></i>
              </span>
            </div>
            <span className="text-xs text-center max-w-[60px] truncate">Your Story</span>
          </div> }
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={`loading-${index}`} className="flex flex-col justify-center items-center min-w-[80px]">
                <div className="p-[4px] w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-1 bg-gray-200 animate-pulse">
                  <div className="w-full h-full rounded-full bg-gray-300"></div>
                </div>
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))
          ) : 
          stories.length > 0 ? (
            getSortedStories().map((story, index) => (
              <div
                key={`${story.storyId}-${story._originalIndex}`}
                className=" flex flex-col justify-center items-center  min-w-[95px] mr-2"
              >
                <div
                  className={`p-[4px] w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-1 ${story.viewed ? 'border-2 border-white bg-slate-200' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'}`}
                  onClick={() => {
                    setStoryModalOpen(true);
                    setStoryModalIndex(index);
                    setSortedStoriesForModal(getSortedStories());
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={story.profilePicture || defaultProfilePicture} onError={e => e.target.src = defaultProfilePicture}
                    alt={story.userId}
                    className="object-cover w-full h-full rounded-full border-2 border-white"
                  />
                </div>
                <span className="text-xs text-center max-w-[60px] truncate">{story.userId}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full text-gray-500">
              <span className="text-sm">No stories available</span>
            </div>
          )}
        </div>
        {isOverflowing && canScrollRight && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full  p-1"
            onClick={() => scrollRef.current.scrollBy({ left: 262, behavior: 'smooth' })}
            type="button"
          >
            <i className="fa-solid fa-circle-chevron-right text-2xl text-white"></i>
          </button>
        )}
      </div>
      {storyModalOpen && (
        <StoryModal
          stories={sortedStoriesForModal}
          initialIndex={storyModalIndex}
          onClose={() => setStoryModalOpen(false)}
          onStoryViewed={handleStoryViewed}
          setUserStoryViewed={setUserStoryViewed}
        />
      )}
      {showStoryUpload && (
        <StoryUpload onClose={() => setShowStoryUpload(false)} />
      )}
      {showSingleStoryModal && selectedStory && (
        <SingleStoryModal
          story={selectedStory}
          onClose={() => setShowSingleStoryModal(false)}
        />
      )}
    </>
  );
} 