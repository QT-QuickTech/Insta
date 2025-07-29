import React, { useState, useEffect } from 'react';
import { getSuggections,setFollow,setUnfollow,sentRequest,cancelRequest } from '../service/Api';
import { getUser } from '../service/Api';
import { useNavigate } from 'react-router-dom';
import defaultProfilePicture from '../images/Profile.webp';


function SuggestionUser({ user, loggedUser, onUserClick }) {
  const [requested, setRequested] = useState(user.requested || false);
  const [followed, setFollowed] = useState(user.followed || false);

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
    } else if (user.private) {
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
    <div className="flex items-center justify-between">
      <div
        className="flex items-center"
        onClick={() => onUserClick(user.userId, user)}
        style={{ cursor: 'pointer' }}
      >
        <img src={user.profilePicture || defaultProfilePicture} alt={user.userId} className="w-12 h-12 rounded-full mr-3 object-cover" onError={e => e.target.src = defaultProfilePicture} />
        <div>
          <div className="font-semibold text-gray-800 text-sm">{user.userId}</div>
          <div className="text-xs text-gray-500">{user.username}</div>
        </div>
      </div>
      <button
        className={`text-xs font-semibold px-3 py-1 rounded transition-colors duration-150  ${
          requested
            ? 'bg-transparent text-gray-500 border-gray-300'
            : followed
              ? 'bg-transparent text-gray-500 border-gray-300'
              : 'bg-transparent text-blue-400 border-gray-300'
        }`}
        onClick={handleFollowClick}
      >
        {requested
          ? 'Requested'
          : followed
            ? 'Following'
            : 'Follow'}
      </button>
    </div>
  );
}

export default function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const user=getUser();
  
  useEffect(() => {
    setLoading(true);
    getSuggections().then(data => {
      setSuggestedUsers(data);
      setLoading(false);
    }).catch(() => {
      setSuggestedUsers([]);
      setLoading(false);
    });
  }, []);

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

  const handleSeeAllClick = () => {
    setShowAll(!showAll);
    if (!showAll) {
      // Show all user IDs when "See All" is clicked
      console.log("All suggested user IDs:", suggestedUsers.map(user => user.userId));
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-1/4 ml-2 mt-12 pt-2 max-w-[20rem] mr-8">
      {/* Current User */}
      <div 
        className="flex items-center mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
        onClick={() => handleUserClick(user.userId, user)}
      >
        <img src={user.profilePicture || defaultProfilePicture  } alt={user.userId} className="w-12 h-12 rounded-full mr-3 object-cover" onError={e => e.target.src = defaultProfilePicture} />
        <div>
          <div className="font-semibold text-gray-800 text-sm">{user.userId}</div>
          <div className="text-xs text-gray-500">{user.username}</div>
        </div>
      </div>
      {/* Suggestions */}
      <div className="p-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Suggested for you</h3>
          <button 
            className="text-xs text-gray-700 font-semibold hover:underline"
            onClick={handleSeeAllClick}
          >
            {showAll ? 'Show Less' : 'See All'}
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={`loading-suggestion-${idx}`} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-16 h-7 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            suggestedUsers.slice(0, showAll ? suggestedUsers.length : 6).map((u) => (
              <SuggestionUser key={u.userId} user={u} loggedUser={user} onUserClick={handleUserClick} />
            ))
          )}
        </div>  
      </div>
    </aside>
  );
} 