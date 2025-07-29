import React, { useState, useEffect, useRef } from 'react';
import PostInfo from './PostInfo';
import { getFeeds,setLike,setUnlike,setSave,setUnsave } from '../service/Api';
import { useNavigate } from 'react-router-dom';
import defaultProfilePicture from '../images/profile.webp'; 
import defaultVideo from '../images/mockVideo.mp4';
import defaultImage from '../images/mockImage.jpg';


// FeedInfo child component
function FeedInfo(props) {
  const { post,  onUserClick, onCommentClick } = props;
  const [liked, setLiked] = useState(post.liked || false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [saved, setSaved] = useState(post.saved || false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);
  const handleLike = () => {
   
    if (!liked) {
      setLike(post.postId);
      setLikes((prev) => prev + 1);
      post.liked=true;
      post.likes=likes+1;
     
    } else {
      setUnlike(post.postId);
      setLikes((prev) => prev - 1);
     
      post.liked=false;
      post.likes=likes-1;
    }
    setLiked((prev) => !prev);
  };
  const handleSave = () => {
    saved?setUnsave(post.postId):setSave(post.postId);
    saved?post.saved=false:post.saved=true;
    setSaved((prev) => !prev);
  };

  return (
    <div key={post.postId} className="bg-white px-4 md:px-10">
      <div className="flex items-center px-2 py-3 ">
        <img
          src={post.user.profilePicture || defaultProfilePicture}
          alt={post.user.userId}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 "
          style={{ cursor: 'pointer' }}
          onClick={() => onUserClick(post.user.userId, post.user)}
          onError={(e) => e.target.src = defaultProfilePicture}
        />
        <div className="ml-3 flex-1">
          <span className="font-semibold text-gray-800 text-sm cursor-pointer" onClick={() => onUserClick(post.user.userId, post.user)}>
            {post.user.userId}
          </span>
        </div>
      </div>
      <div className="w-full flex items-center justify-center" style={{ minHeight: 'calc(80vh - 64px)' }}> 
        {post.mediaType === 'video' ? (
        <div
           className="relative w-full h-[calc(80vh-64px)] flex items-center justify-center"
           onClick={() => {
             const video = videoRef.current;
             if (video) {
               if (video.paused) {
                 video.play();
               } else {
                 video.pause();
               }
             }
           }}
         >
           <video
             ref={videoRef}
             src={post.mediaUrl || defaultVideo}
             autoPlay
             playsInline
             loop
             muted
             className="w-full h-full object-cover bg-black rounded-xl shadow-lg"
             onPlay={() => setIsPaused(false)}
             onPause={() => setIsPaused(true)}
             onError={e => { e.target.onerror = null; e.target.src = defaultVideo; }}
           />
           {isPaused && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/30">
               <svg width="64" height="64" viewBox="0 0 24 24" fill="white" className="opacity-80">
                 <polygon points="8,5 19,12 8,19" />
               </svg>
             </div>
           )}
         </div>
        ) : (
          <img src={post.mediaUrl || defaultImage} alt={post.caption} className="w-full h-[calc(80vh-64px)] object-cover rounded-md" onError={e => e.target.src = defaultImage} />
        )}
      </div>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
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
          <button
            className="hover:scale-110 transition-transform"
            aria-label="Comment"
            onClick={() => onCommentClick(post)}
          >
            <i className="fa-regular fa-comment text-2xl"></i>
          </button>
          <button
            className="hover:scale-110 transition-transform"
            aria-label="Share"
            onClick={() => { /* Placeholder for share functionality */ }}
          >
            <i className="fa-regular fa-paper-plane text-2xl"></i>
          </button>
        </div>
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
      <div className="font-semibold text-gray-800 text-sm mb-1">{likes} likes</div>
      <div className="mb-1">
        <span className="font-semibold text-gray-800 mr-2 text-sm">{post.user.userId}</span>
        <span className="text-gray-700 text-sm">{post.caption}</span>
      </div>
      <div className="text-xs text-gray-500 mb-1 cursor-pointer" onClick={() => onCommentClick(post)}>
        View all {Array.isArray(post.comments) ? post.comments.length : post.comments} comments
      </div>
      <div className="text-xs text-gray-400">{post.createdAt}</div>
    </div>
  );
}

export default function HomePostFeed({ onCloseOverlays }) {
  const navigate = useNavigate();
  const [feedPosts, setFeedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);

  useEffect(() => {
    fetchPosts(page);
    // eslint-disable-next-line
  }, [page]);

  const fetchPosts = async (pageNum) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const data = await getFeeds(pageNum);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setFeedPosts(prev => [...prev, ...data]);
      }
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

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


  const userClickHandler = (userId, user) => {
    if (window.location.pathname === `/user/${userId}`) {
      navigate('/', { replace: true });
      setTimeout(() => {
        navigate(`/user/${userId}`, { replace: true, state: { user } });
        window.dispatchEvent(new Event('forceSidebarReset'));
        if (onCloseOverlays) onCloseOverlays();
      }, 0);
    } else {
      navigate(`/user/${userId}`, { state: { user } });
      if (onCloseOverlays) onCloseOverlays();
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full mt-6">
      {loading ? (
        Array.from({ length: 4 }).map((_, idx) => (
          <div key={`loading-post-${idx}`} className="bg-white px-4 md:px-10 py-6 rounded-lg animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="w-full h-64 bg-gray-200 rounded mb-4"></div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full ml-auto"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))
      ) : (
        feedPosts.map((post) => (
          <FeedInfo
            key={post.postId}
            post={post}
            onUserClick={userClickHandler}
            onCommentClick={setSelectedPost}
          />
        ))
      )}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {!hasMore && <div className="text-center py-4 text-gray-400">No more posts</div>}
      {selectedPost && (
        <PostInfo post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}

