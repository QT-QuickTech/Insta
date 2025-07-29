import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { commentData,likeData } from '../service/DB';
import { getUser ,getComments ,getLikes ,setLike,setUnlike,setSave,setUnsave ,setComment} from '../service/Api';
import { useNavigate } from 'react-router-dom';
import defaultProfilePicture from '../images/Profile.webp';
import defaultVideo from '../images/mockVideo.mp4';
import defaultImage from '../images/mockImage.jpg';

export default function PostInfo({ imageUrls, onClose, post }) {
  const navigate = useNavigate();
  const user=getUser();
  if (!post) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-500">No post data available.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
        </div>
      </div>
    );
  }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(post.liked || false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [saved, setSaved] = useState(post.saved || false);
  const [commentInput, setCommentInput] = useState("");
  const [commentList, setCommentList] = useState([]);
  const [likeList, setLikeList] = useState([]);
  const [showLikes, setShowLikes] = useState(false);

  useEffect(() => {
    getComments(post.postId)
      .then(data => setCommentList(data))
      .catch(() => setCommentList(commentData));
    getLikes(post.postId)
      .then(data => setLikeList(data))
      .catch(() => setLikeList(likeData));
  }, [post.postId]);

  const handleLike = () => {
    
    if (!liked) {
      setLike(post.postId);
      setLikes((prev) => prev + 1);
      setLikeList((prev) => [...prev, { user }]);
      post.liked=true;
      post.likes=likes+1;
     
    } else {
      setUnlike(post.postId);
      setLikes((prev) => prev - 1);
      // Remove user from likeList
      setLikeList((prev) => prev.filter(like => like.user.userId !== user.userId));
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

  const handleAddComment = (e) => {
    e.preventDefault();
    if (commentInput.trim() === "") return;
    // For demo, use a mock user for the new comment
    setComment(post.postId,commentInput.trim());
    const newComment = {
      commentId: Date.now(),
      commentText: commentInput.trim(),
      commentTime: new Date().toISOString(),
      user: user
    };
    setCommentList((prev) => [...prev, newComment]);
    // setComments((prev) => prev + 1); // This line was commented out in the original file
    setCommentInput("");
  };
 
  const handleShowLikes = () => setShowLikes(true);
  const handleShowComments = () => setShowLikes(false);

  const userClickHandler = (userId,user) => {
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
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
      {/* Overlay Box */}
      <div className="bg-white w-[90%] h-[90%] flex rounded-lg overflow-hidden shadow-lg relative">
        {/* Left: Image/Video Viewer */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          {post && post.mediaType === 'video' ? (
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={() => {
                const video = document.getElementById('postinfo-video');
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
                id="postinfo-video"
                src={post.mediaUrl || defaultVideo}
                autoPlay
                playsInline
                loop
                className="w-full h-full object-contain bg-black rounded-xl shadow-lg"
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
                onError={e => e.target.src = defaultVideo}
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
            <img
              src={post ? post.mediaUrl || defaultImage : imageUrls[currentIndex]}
              alt="post"
              className="w-full h-full object-contain bg-black"
              onError={e => e.target.src = defaultImage}
            />
          )}
        </div>

        {/* Right: Post Details */}
        <div className="w-[400px] flex flex-col border-l border-gray-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2 " >
              <img
                src={post.user.profilePicture || defaultProfilePicture}
                className="w-8 h-8 rounded-full cursor-pointer"
                onClick={() => userClickHandler(post.user.userId,post.user)}
                alt="user"
                onError={e => e.target.src = defaultProfilePicture}
              />
              <span className="font-semibold cursor-pointer"
                    onClick={() => userClickHandler(post.user.userId,post.user)}>
                      {post.user.userId || 'Unknown User'}
              </span>
            </div>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Likes/Comments Toggle Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {showLikes ? (
              likeList && likeList.length > 0 ? (
                likeList.map((like, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <img src={like.user.profilePicture || defaultProfilePicture} alt={like.user.userId} className="w-6 h-6 rounded-full" onError={e => e.target.src = defaultProfilePicture} />
                    <span className="font-semibold text-sm">{like.user.userId}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">No likes yet.</div>
              )
            ) : (
              commentList && commentList.length > 0 ? (
                commentList.map((comment, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <img src={comment.user.profilePicture || defaultProfilePicture  } alt={comment.user.userId} className="w-6 h-6 rounded-full" onError={e => e.target.src = defaultProfilePicture} />
                    <span className="font-semibold text-sm">{comment.user.userId}</span>
                    <span className="text-gray-700 text-sm">{comment.commentText}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">No comments yet.</div>
              )
            )}
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center pl-2 gap-4">
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
                onClick={handleShowComments}
              >
                <i className="fa-regular fa-comment text-2xl"></i>
              </button>
              <button className="hover:scale-110 transition-transform" aria-label="Share"><i className="fa-regular fa-paper-plane text-2xl"></i></button>
            </div>
            <button
              className="hover:scale-110 transition-transform pr-2"
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

          {/* Likes & Time */}
          <div className="px-4 text-sm text-gray-600 cursor-pointer" onClick={handleShowLikes}>
            Liked by {likeList.length > 0 ? likeList[0].user.userId : 'Unknown User'} and {likes} others
          </div>
          <div className="px-4 text-xs text-gray-400 mb-2">{post.createdAt}</div>

          {/* Comment Input (only show if not viewing likes) */}
          {!showLikes && (
            <form className="p-4 border-t flex items-center gap-2" onSubmit={handleAddComment}>
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
              />
              <button type="submit" className="text-blue-500 font-semibold text-sm">Post</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
