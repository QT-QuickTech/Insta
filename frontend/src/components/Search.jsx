import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../service/DB';
import { getSearch ,setFollow,setUnfollow,getUser,sentRequest,cancelRequest } from '../service/Api';
import defaultProfilePicture from '../images/profile.webp';

function Search(props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredUsers([]);
      return;
    }
    setLoading(true);
    try {
      const apiUsers = await getSearch(query);
      setFilteredUsers(apiUsers);
    } catch (e) {
      // fallback to local filter if API fails
      const filtered = userData.filter(user =>
        user.userId.toLowerCase().includes(query.toLowerCase()) ||
        user.userName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    handleSearch(e.target.value);
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

  return (
    <div className="fixed   bg-white shadow-xl rounded-r-2xl flex flex-col " style={{minWidth: '350px', height: '100vh', maxHeight: '100vh'}}>
      <div className="p-8 pb-0">
        {/* Search Header */}
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <div className="relative mb-6 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleInputChange}
            className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(e.target.value); }}
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400"></i>
          {/* Search button removed */}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={`loading-user-${idx}`} className="flex items-center justify-between p-3 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            filteredUsers.map((user) => (
              <SearchUser key={user.userId} user={user} onUserClick={handleUserClick} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SearchUser({ user, onUserClick }) {
  const [requested, setRequested] = useState(user.requested || false);
  const [followed, setFollowed] = useState(user.followed || false);
  const loggedUser=getUser();
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
    <div style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => onUserClick(user.userId, user)} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
      <div className="flex items-center space-x-3">
        <img
          src={user.profilePicture}
          alt={user.userId}
          className="w-12 h-12 rounded-full object-cover"
          onError={e => e.target.src = defaultProfilePicture}
        />
        <div>
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-sm">{user.userId}</span>
            {user.isVerified && (
              <i className="fa-solid fa-circle-check text-blue-500 text-xs"></i>
            )}
          </div>
          <span className="text-gray-500 text-sm">{user.userName}</span>
        </div>
      </div>
      <button
        className={`px-4 py-1 rounded-lg text-sm font-semibold ${
          requested
            ? 'text-gray-500 hover:text-red-500'
            : followed
              ? 'text-gray-500 hover:text-red-500'
              : 'text-blue-500 hover:text-blue-600'
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

export default Search; 