import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getUser ,getPosts,getSaves,getTags,getFollowers,getFollowing ,setFollow,setUnfollow,removeFollower,setLoggedInUser ,sentRequest,cancelRequest} from '../service/Api';
import PostInfo from './PostInfo';
import UserPosts from './UserPosts';
import { useNavigate } from 'react-router-dom';
import defaultProfilePicture from '../images/Profile.webp';


function Profile(props) {
 
  const loggedInUser=getUser();
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState( null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('posts');
  const [showPostInfo, setShowPostInfo] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isNoFollowPrivateProfile, setIsNoFollowPrivateProfile] = useState(false);
  const [imagePosts, setImagePosts] = useState([]);
  const [videoPosts, setVideoPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [requested, setRequested] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followTab, setFollowTab] = useState('followers');
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  // Loader states for each tab
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingTagged, setLoadingTagged] = useState(false);

  // Fetch followers/following when modal opens (load both at once)
  useEffect(() => {
    if (!showFollowModal || !user) return;
    setLoadingFollowers(true);
    Promise.all([
      getFollowers(user.userId).then(data => setFollowersList(data)).catch(() => setFollowersList([])),
      getFollowing(user.userId).then(data => setFollowingList(data)).catch(() => setFollowingList([]))
    ]).finally(() => setLoadingFollowers(false));
  }, [showFollowModal, user]);
 
  useEffect(() => {
    
    let foundUser = location.state?.user;
    setUser(foundUser);
    setLoading(true);
    setLoadingPosts(true);
    if (!foundUser) return;
    const fetchUserId = foundUser.userId || userId;

    setShowPostInfo(false);
    setSelectedPost(null);
    
    // Check if it's the user's own profile by comparing both URL params and user object
    const ownProfile = (loggedInUser && userId === loggedInUser.userId) || 
                      (loggedInUser && foundUser && foundUser.userId === loggedInUser.userId);
    setIsOwnProfile(ownProfile);
    
    const noFollowPrivate = !ownProfile && !foundUser?.followed && foundUser?.private;
    setIsNoFollowPrivateProfile(noFollowPrivate);
    setFollowed(foundUser?.followed || false);
    setRequested(foundUser?.requested || false);
    
    if(ownProfile){
      setLoggedInUser().then(() => {
        setUser(getUser());
      }).catch(error => {
        console.error('Error updating user data:', error);
      });
    }

    if(!noFollowPrivate){
      getPosts(fetchUserId).then(data => {
        setUserPosts(data);
        setLoadingPosts(false);
        setLoading(false);
        handlePosts(data); // Call handlePosts with data
      }).catch(() => {
        setUserPosts([]); // fallback to empty or you can import postData if you want
        setLoadingPosts(false);
        setLoading(false);
        handlePosts([]); // Call handlePosts with empty
      });
    }else{
      setUserPosts([]);
      setLoadingPosts(false);
      setLoading(false);
      handlePosts([]); // Call handlePosts with empty
    }
  }, [userId, location.state]);

  useEffect(() => {
    handlePosts();
    if (!user || isNoFollowPrivateProfile) {
      setSavedPosts([]);
      setTaggedPosts([]);
      setLoadingSaved(false);
      setLoadingTagged(false);
      setLoading(false);
      return;
    }
    setLoadingSaved(true);
    setLoadingTagged(true);
    getSaves().then(data => { setSavedPosts(data); setLoadingSaved(false); }).catch(() => { setSavedPosts([]); setLoadingSaved(false); });
    getTags(user.userId).then(data => { setTaggedPosts(data); setLoadingTagged(false); }).catch(() => { setTaggedPosts([]); setLoadingTagged(false); });
  }, [userPosts]);

  // Update handlers to accept optional data
  const handlePosts = () => {
    const source =  userPosts;
    setImagePosts(source.filter(post => post.mediaType === 'image'));
    setSelectedTab('posts');
  };
  const handleReels = () => {
    const source =  userPosts;
    setVideoPosts(source.filter(post => post.mediaType === 'video'));
    setSelectedTab('reels');
  };
  const handleSaved = () => {
    setSelectedTab('saved');
    setLoadingSaved(true);
    getSaves().then(data => { setSavedPosts(data); setLoadingSaved(false); }).catch(() => { setSavedPosts([]); setLoadingSaved(false); });
  };
  const handleTag = () => {
    setSelectedTab('tagged');
    setLoadingTagged(true);
    getTags(user.userId).then(data => { setTaggedPosts(data); setLoadingTagged(false); }).catch(() => { setTaggedPosts([]); setLoadingTagged(false); });
  };

  // Re-add handleFollow function
  const handleFollow = () => {
    if (requested) {
      setRequested(false);
      user.requested=false;
      // Cancel follow request
      cancelRequest(user.userId);
    } else if (followed) {
      setFollowed(false); // Unfollow
      setUnfollow(user.userId);
      loggedInUser.following=loggedInUser.following-1;
      user.followed=false;
      user.followers=user.followers-1;
      if(user.private){
        setIsNoFollowPrivateProfile(true);
      }
    } else if (user?.private) {
      setRequested(true);
      user.requested=true;
      // Send follow request
      sentRequest(user.userId);
    } else {
      setFollowed(true); // Follow public
      setFollow(user.userId);
      loggedInUser.following=loggedInUser.following+1;
      user.followed=true;
      user.followers=user.followers+1;
    }
  };

  const [confirmRemove, setConfirmRemove] = useState(null); // user to remove
  const removeFollows = (user) => {
    setConfirmRemove(user);
  }
  const handleConfirmRemove = () => {
    if (!confirmRemove) return;
    if (followTab === 'following') {
      setUnfollow(confirmRemove.userId);
      loggedInUser.following = loggedInUser.following - 1;
      confirmRemove.followed = false;
      confirmRemove.followers = confirmRemove.followers - 1;
      setFollowingList(list => list.filter(u => u.userId !== confirmRemove.userId));
    } else {
      removeFollower(confirmRemove.userId, loggedInUser.userId);
      loggedInUser.followers = loggedInUser.followers - 1;
      setFollowersList(list => list.filter(u => u.userId !== confirmRemove.userId));
    }
    setConfirmRemove(null);
  }
  const handleCancelRemove = () => setConfirmRemove(null);

  if (!user) return <div className="p-8">User not found.</div>;



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
    <>
      {showPostInfo && selectedPost && (
        <PostInfo
          post={selectedPost}
          imageUrls={[selectedPost.image || selectedPost.imageUrl]}
          onClose={() => setShowPostInfo(false)}
        />
      )}
      {/* Modal for Followers/Following */}
      {showFollowModal && !isNoFollowPrivateProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b p-4">
              <div className="flex space-x-4">
                <button
                  className={`font-semibold ${followTab === 'followers' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}
                  onClick={() => setFollowTab('followers')}
                >
                  Followers
                </button>
                <button
                  className={`font-semibold ${followTab === 'following' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}
                  onClick={() => setFollowTab('following')}
                >
                  Following
                </button>
              </div>
              <button onClick={() => setShowFollowModal(false)}>
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              {loadingFollowers ? (
                <div className="flex justify-center items-center h-32">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </div>
              ) : (
                (followTab === 'followers' ? followersList : followingList).map((u) => (
                  <div key={u.userId} className="flex items-center mb-2 " >
                    <img src={u.profilePicture} alt={u.userId} className="w-8 h-8 rounded-full mr-3 " onClick={() => userClickHandler(u.userId,u)} onError={e => e.target.src = defaultProfilePicture} />
                    <div className='flex flex-col'>
                      <span className='cursor-pointer' onClick={() => userClickHandler(u.userId,u)}>{u.username}</span>
                      <span className="text-xs text-gray-500 cursor-pointer" onClick={() => userClickHandler(u.userId,u)}>{u.userId}</span>
                    </div>
                    {u.followed ? (
                      <span className="ml-4 text-xs text-gray-400 cursor-pointer" onClick={() => userClickHandler(u.userId,u)}>Following</span>
                    ) : (
                      <span className="ml-4 text-xs text-gray-400 cursor-pointer" onClick={() => userClickHandler(u.userId,u)}>Follow</span>
                    )}
                    <div className="flex-1" />
                 {isOwnProfile && <button className="ml-2 text-xs text-gray-700 bg-gray-200 rounded px-2 py-1 hover:bg-gray-300" onClick={() => removeFollows(u)}>Remove</button>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Custom Remove Confirmation Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-center">
              {followTab === 'following'
                ? 'Are you sure you want to unfollow this user?'
                : 'Are you sure you want to remove this follower?'}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={handleCancelRemove}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={handleConfirmRemove}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-full p-6 font-sans">
        {/* Profile Header */}
        <div className="max-w-3xl flex items-center gap-12 mb-8 mx-auto">
          <img src={user.profilePicture} className="w-44 h-44 rounded-full object-cover border" alt={user.userId} onError={e => e.target.src = defaultProfilePicture} />
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-light">{user.userName}</span>
              <div className="font-semibold  ">{user.userId}</div>
              {!isOwnProfile && (
                <button
                  className={`px-4 py-1 ml-4 rounded text-sm border font-semibold transition-colors duration-150 ${
                    requested
                      ? 'bg-transparent text-gray-500 border-gray-300'
                      : followed
                        ? 'bg-transparent text-gray-500 border-gray-300'
                        : 'bg-transparent text-blue-400 border-gray-300'
                  }`}
                  onClick={handleFollow}
                >
                  {requested
                    ? 'Requested'
                    : followed
                      ? 'Following'
                      : 'Follow'}
                </button>
              )}
              {isOwnProfile && (
                <button className="px-4 py-1 ml-4 rounded text-sm border font-semibold">Edit Profile</button>
              )}
            </div>
            <div className="flex gap-8 mb-2">
              <span><b>{user.posts}</b> posts</span>
              <span style={{cursor: 'pointer'}} onClick={() => { if (user && !isNoFollowPrivateProfile) { setShowFollowModal(true); setFollowTab('followers'); } }}><b>{user.followers}</b> followers</span>
              <span style={{cursor: 'pointer'}} onClick={() => { if (user && !isNoFollowPrivateProfile) { setShowFollowModal(true); setFollowTab('following'); } }}><b>{user.following}</b> following</span>
            </div>
          
              <div className="text-sm">
                <div className="font-semibold">{user.username}</div>
                <div>@{user.userId}</div>
                {!isNoFollowPrivateProfile && <div>{user.bio}</div>}
                {/* {user.website && (
                  <a href={user.websiteUrl} className="text-blue-500 hover:underline block" target="_blank" rel="noopener noreferrer">{user.websiteUrl}</a>
                )} */}
              </div>
            
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-b  space-x-12 text-sm font-semibold mb-4 flex justify-around">
          <div
            className={`flex flex-col items-center cursor-pointer px-4 ${selectedTab === 'posts' ? 'text-black' : 'text-gray-400'}`}
            onClick={() => handlePosts() }
          >
            <i className="fa-solid fa-table-columns text-xl"></i>
            {selectedTab === 'posts' && <div className="w-16 h-1 bg-black rounded-full mt-1" />}
          </div>
          <div
            className={`flex flex-col items-center cursor-pointer px-4 ${selectedTab === 'reels' ? 'text-black' : 'text-gray-400'}`}
            onClick={() =>handleReels() }
          >
            <i className="fa-solid fa-play text-xl"></i>
            {selectedTab === 'reels' && <div className="w-16 h-1 bg-black rounded-full mt-1" />}
          </div>
          {isOwnProfile && (
            <div
              className={`flex flex-col items-center cursor-pointer px-4 ${selectedTab === 'saved' ? 'text-black' : 'text-gray-400'}`}
              onClick={() =>handleSaved() }
            >
              <i className="fa-solid fa-bookmark text-xl"></i>
              {selectedTab === 'saved' && <div className="w-16 h-1 bg-black rounded-full mt-1" />}
            </div>
          )}
          <div
            className={`flex flex-col items-center cursor-pointer px-4 ${selectedTab === 'tagged' ? 'text-black' : 'text-gray-400'}`}
            onClick={() =>handleTag() }
          >
            <i className="fa-solid fa-user-tag text-xl"></i>
            {selectedTab === 'tagged' && <div className="w-16 h-1 bg-black rounded-full mt-1" />}
          </div>
        </div>

        {/* Posts Grid or Private Message */}
        {isNoFollowPrivateProfile ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <i className="fa-solid fa-lock text-5xl mb-4" />
            <span className="text-lg">This account is private</span>
            <span className="text-sm">Follow to see their photos and videos.</span>
          </div>
        ) : (
          <>
            {(selectedTab === 'posts' && loadingPosts) ||
             (selectedTab === 'saved' && loadingSaved) ||
             (selectedTab === 'tagged' && loadingTagged) ? (
              <div className="grid grid-cols-3 gap-2 p-6">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div key={idx} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {selectedTab === 'posts' && (
                  <UserPosts posts={imagePosts} setSelectedPost={setSelectedPost} setShowPostInfo={setShowPostInfo} isOwnProfile={isOwnProfile} tab={'posts'}/>
                )}
                {selectedTab === 'reels' && (
                  <UserPosts posts={videoPosts} setSelectedPost={setSelectedPost} setShowPostInfo={setShowPostInfo} isOwnProfile={isOwnProfile} tab={'reels'}/>
                )}
                {selectedTab === 'saved' && isOwnProfile && (
                  <UserPosts posts={savedPosts} setSelectedPost={setSelectedPost} setShowPostInfo={setShowPostInfo} isOwnProfile={isOwnProfile} tab={'saved'}/>
                )}
                {selectedTab === 'tagged' && (
                  <UserPosts posts={taggedPosts} setSelectedPost={setSelectedPost} setShowPostInfo={setShowPostInfo} isOwnProfile={isOwnProfile} tab={'tagged'}/>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Profile; 