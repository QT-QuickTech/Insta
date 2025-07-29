import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { reelTags, reelLocations, reelData } from '../service/DB';
import { FaVolumeMute, FaPlay } from "react-icons/fa";
import { MdLocationPin } from "react-icons/md";
import { useSwipeable } from 'react-swipeable';
import PostInfo from './PostInfo';
import { getReels,setLike,setUnlike,setSave,setUnsave ,setFollow,setUnfollow,getUser,sentRequest,cancelRequest} from '../service/Api';
import defaultProfilePicture from '../images/Profile.webp';
import defaultVideo from '../images/mockVideo.mp4';

const INITIAL_LOAD = 10;
const LOAD_MORE = 10;

// ReelInfo child component
function ReelInfo({ reel, onUserClick, onCommentClick,  muted, toggleMute, isPlaying, videoRef, togglePlay }) {
  const [liked, setLiked] = useState(reel.liked || false);
  const [likes, setLikes] = useState(reel.likes || 0);
  const [saved, setSaved] = useState(reel.saved || false);
  const [requested, setRequested] = useState(reel.user.requested || false);
  const [followed, setFollowed] = useState(reel.user.followed || false);
  const [user, setUser] = useState(reel.user);
  const loggedUser=getUser();
  const handleLike = () => {
    if (!liked) {
      setLike(reel.postId);
      setLikes((prev) => prev + 1);
      reel.liked=true;
      reel.likes=likes+1;
     
    } else {
      setUnlike(reel.postId);
      setLikes((prev) => prev - 1);
     
      reel.liked=false;
      reel.likes=likes-1;
    }
    setLiked((prev) => !prev);
  };
  const handleSave = () => {
    saved?setUnsave(reel.postId):setSave(reel.postId);
    saved?reel.saved=false:reel.saved=true;
    setSaved((prev) => !prev);
  };
  const handleFollowClick = (e) => {
    e.stopPropagation();
    if (requested) {
      setRequested(false);
      user.requested=false;
      // Cancel follow request
      cancelRequest(user.userId);
    } else if (followed) {
      setFollowed(false); // Unfollow
      setUnfollow(user.userId);
      loggedUser.following=loggedUser.following-1;
      user.followed=false;
      user.followers=user.followers-1;
    } else if (reel.user.private) {
      setRequested(true);
      user.requested=true;
      // Send follow request
      sentRequest(user.userId);
    } else {
      setFollowed(true); // Follow public
      setFollow(user.userId);
      loggedUser.following=loggedUser.following+1;
      user.followed=true;
      user.followers=user.followers+1;
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-white ">
      {/* Video or Image container */}
      <div
        className="relative overflow-hidden cursor-pointer w-[300px] h-[calc(100vh-64px)] flex items-center justify-center bg-white rounded-xl border-2 border-white"
        onClick={togglePlay}
      >
        {reel.mediaType === 'video' ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover bg-white"
            muted={muted}
            loop
            playsInline
            onError={e => {
              console.error('Video failed to load:', reel.mediaUrl, e);
            }}
          >
            <source src={reel.mediaUrl} onError={e => e.target.src = defaultVideo} />
            <source src="https://samplelib.com/mp4/sample-5s.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : reel.mediaUrl ? (
          <img
            src={reel.mediaUrl}
            alt={reel.caption || 'reel'}
            className="w-full h-full object-cover max-h-full"
            onError={e => e.target.src = reel.mediaUrl}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-600">
            No media available
          </div>
        )}
        {/* Mute Icon */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleMute();
          }}
          className="absolute top-2 right-2 bg-black/60 rounded-full p-2 text-white"
          style={{ margin: 0, padding: 0 }}
          aria-label="Mute"
        >
          <FaVolumeMute size={16} />
        </button>
        {/* Center play icon */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <FaPlay className="text-white text-4xl" />
          </div>
        )}
        {/* Bottom details */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white text-sm pointer-events-none">
          <div className="flex items-center gap-2 mb-2 pointer-events-auto">
            <img
              src={reel.user.profilePicture}
              onError={e => e.target.src = defaultProfilePicture}
              className="w-8 h-8 rounded-full border border-white cursor-pointer hover:opacity-80"
              onClick={() => onUserClick(reel.user.userId, reel.user)}
              alt={reel.user.userId}
            />
            <span
              className="font-semibold cursor-pointer hover:underline"
              onClick={() => onUserClick(reel.user.userId, reel.user)}
            >
              @{reel.user.userId}
            </span>
            <button
              className={`ml-1 text-xs pointer-events-auto px-3 py-1 rounded font-semibold transition-colors duration-150 ${
                requested
                  ? 'bg-transparent text-gray-500 border border-gray-300'
                  : followed
                    ? ' text-gray-500 bg-transparent border border-gray-300'
                    : ' text-blue-400 bg-transparent border border-gray-300'
              }`}
              onClick={handleFollowClick}
              disabled={false}
            >
              {requested
                ? 'Requested'
                : followed
                  ? 'Following'
                  : 'Follow'}
            </button>
          </div>
          <div className="text-xs mb-2">
            📍 All the places to visit in {reel.location.split(",")[0]}...
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="bg-white/20 rounded-full px-2 py-1 text-xs flex items-center gap-1">
              ↗ {reel.tag}
            </span>
            <span className="bg-white/20 rounded-full px-2 py-1 text-xs flex items-center gap-1">
              <MdLocationPin /> {reel.location}
            </span>
          </div>
        </div>
      </div>
      {/* Action icons column outside video, close to video */}
      <div className="flex flex-col items-center gap-6 ml-6 text-gray-700 h-full justify-center">
        <div className="flex flex-col items-center">
          <button
            className="hover:scale-110 transition-transform"
            aria-label="Like"
            onClick={handleLike}
          >
            {liked ? (
              <i className="fa-solid fa-heart text-2xl text-red-500"></i>
            ) : (
              <i className="fa-regular fa-heart text-2xl"></i>
            )}
          </button>
          <span className="text-xs mt-1">{Math.floor(likes)}</span>
        </div>
        <div className="flex flex-col items-center">
          <button
            className="hover:scale-110 transition-transform"
            aria-label="Comment"
            onClick={() => onCommentClick(reel)}
          >
            <i className="fa-regular fa-comment text-2xl"></i>
          </button>
          <span className="text-xs mt-1">{reel.comments}</span>
        </div>
        <div className="flex flex-col items-center">
          <button
            className="hover:scale-110 transition-transform"
            aria-label="Share"
            onClick={() => onCommentClick(reel)}
          >
            <i className="fa-regular fa-paper-plane text-2xl"></i>
          </button>
        </div>
        <div className="flex flex-col items-center">
          <button
            className="hover:scale-110 transition-transform"
            aria-label="Save"
            onClick={handleSave}
          >
            {saved ? (
              <i className="fa-solid fa-bookmark text-2xl text-black"></i>
            ) : (
              <i className="fa-regular fa-bookmark text-2xl"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef([]);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef(null);
  const snapRefs = useRef([]);
  const navigate = useNavigate();
  const [selectedReel, setSelectedReel] = useState(null);
  const [followRequests, setFollowRequests] = useState({});
  const didFetch = useRef(false); // Prevent double-fetch
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  // Debounce ref for wheel event
  const wheelTimeout = useRef(null);

  // Keep the initial load effect as is, but do not allow further appending
  useEffect(() => {
    fetchReels(page);
    // eslint-disable-next-line
  }, [page]);

  const fetchReels = async (pageNum) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const data = await getReels(pageNum);
      if (!data || data.length === 0) {
        setHasMore(false);
      } else {
        const reeldatas = data.map(reel => ({
          ...reel,
          tag: reelTags[Math.floor(Math.random() * reelTags.length)],
          location: reelLocations[Math.floor(Math.random() * reelLocations.length)],
        }));
        setReels(prev => [...prev, ...reeldatas]);
      }
    } catch {
      // fallback to static data if needed
      if (reels.length === 0) {
        setReels(
          reelData.slice(0, INITIAL_LOAD).map(reel => ({
            ...reel,
            tag: reelTags[Math.floor(Math.random() * reelTags.length)],
            location: reelLocations[Math.floor(Math.random() * reelLocations.length)],
          }))
        );
      }
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // Infinite scroll for Reels: fetch more when near the end of the window
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);
  // Intersection Observer for snap detection
  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.6,
    };
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-index'));
          setCurrentIndex(idx);
        }
      });
    };
    const observer = new window.IntersectionObserver(callback, options);
    const nodes = document.querySelectorAll('.reel-snap');
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [reels.length]);

  // Auto-play the current video
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIndex) {
        video.currentTime = 0;
        video.play();
      } else {
        video.pause();
      }
    });
    setIsPlaying(true);
  }, [currentIndex, reels.length]);

  useEffect(() => {
    if (snapRefs.current[currentIndex]) {
      console.log('Scrolling to index', currentIndex);
      snapRefs.current[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex]);

  const togglePlay = () => {
    const video = videoRefs.current[currentIndex];
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
    const video = videoRefs.current[currentIndex];
    if (video) {
      video.muted = !video.muted;
    }
  };

  // Handle wheel scroll to move one video at a time
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const handleWheel = (e) => {
      if (wheelTimeout.current) return;
      if (Math.abs(e.deltaY) < 30) return; // Only trigger for significant scrolls
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 400); // 400ms debounce
      console.log('Wheel event fired', e.deltaY);
      e.preventDefault();
      if (e.deltaY > 0 && currentIndex < reels.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    };
    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', handleWheel);
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, [currentIndex, reels.length]);

  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (currentIndex < reels.length - 1) setCurrentIndex(prev => prev + 1);
    },
    onSwipedDown: () => {
      if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    },
    delta: 50,
    trackTouch: true,
    trackMouse: false,
    preventDefaultTouchmoveEvent: true,
  });

  // Scroll to the current video when currentIndex changes


  //

  // Follow button handler
  const handleFollow = (userId, isPrivate) => {
    setReels(prevReels =>
      prevReels.map(reel =>
        reel.user.userId === userId
          ? isPrivate
            ? reel // For private, do not change followed
            : { ...reel, user: { ...reel.user, followed: !reel.user.followed } }
          : reel
      )
    );
    if (isPrivate) {
      setFollowRequests(prev => ({ ...prev, [userId]: true }));
    }
  };

  const handleUserClick = (userId, user) => {
    if (window.location.pathname === `/user/${userId}`) {
      navigate('/', { replace: true });
      setTimeout(() => {
        navigate(`/user/${userId}`, { replace: true, state: { user } });
        window.dispatchEvent(new Event('forceSidebarReset'));
        if (props.onCloseOverlays) props.onCloseOverlays();
      }, 0);
    } else {
      navigate(`/user/${userId}`, { state: { user } });
      if (props.onCloseOverlays) props.onCloseOverlays();
    }
  };
  // Log reels only when it changes

  // Trigger infinite load when reaching the last video
  useEffect(() => {
    if (
      currentIndex === reels.length - 1 &&
      hasMore &&
      !loading
    ) {
      setPage(prev => prev + 1);
    }
  }, [currentIndex, reels.length, hasMore, loading]);

  return (
    <div
      ref={containerRef}
      className="relative bg-white w-full mx-auto"
      style={{ scrollBehavior: 'smooth' }}
      {...handlers}
    >
      {reels.map((reel, index) => (
        <div
          key={reel.id || index}
          data-index={index}
          ref={el => snapRefs.current[index] = el}
          className="reel-snap w-full h-[calc(100vh-64px)] flex items-center justify-center bg-white  border-white rounded-xl"
          style={{ margin: 0, padding: 0 }}
        >
          <ReelInfo
            reel={reel}
            onUserClick={handleUserClick}
            onCommentClick={setSelectedReel}
            handleFollow={handleFollow}
            muted={muted}
            toggleMute={toggleMute}
            isPlaying={isPlaying}
            videoRef={el => (videoRefs.current[index] = el)}
            togglePlay={togglePlay}
          />
        </div>
      ))}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {!hasMore && <div className="text-center py-4 text-gray-400">No more reels</div>}
      {selectedReel && (
        <PostInfo post={selectedReel} onClose={() => setSelectedReel(null)} />
      )}
    </div>
  );
}
