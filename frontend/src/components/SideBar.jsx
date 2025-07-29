import React, { useState, useEffect } from 'react'
import { sidebarItems } from '../service/DB';
import { Link, useLocation } from 'react-router-dom'
import { getUser } from '../service/Api';
import instagramLogo from '../images/instagram_logo.png'; 

function SideBar({ onSearchClick, isSearchMode, onNotificationClick, isNotificationMode, onCloseOverlays, noSidebarSelection }) {
  const location = useLocation();
  const [user, setUser] = useState(getUser());

  // Update user data when location changes (profile navigation)
  useEffect(() => {
    setUser(getUser());
  }, [location.pathname]);

  // Listen for storage changes to update user data
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getUser());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes periodically (for same-tab updates)
    const interval = setInterval(() => {
      const currentUser = getUser();
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    }, 100); // Check less frequently but still responsive

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  // Force re-render when user data changes
  useEffect(() => {
    const checkUserData = () => {
      const currentUser = getUser();
      if (currentUser && (!user || currentUser.userId !== user.userId)) {
        setUser(currentUser);
      }
    };
    
    checkUserData();
  }, [location.pathname, user]);

  // Force re-render when location changes to profile
  useEffect(() => {
    if (location.pathname.startsWith('/profile/')) {
      // Small delay to ensure Profile component has updated the user data
      const timer = setTimeout(() => {
        const newUser = getUser();
        setUser(newUser);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);
  const handleItemClick = (itemName) => {
    if (itemName === 'Search') {
      onSearchClick()
    } else if (itemName === 'Notifications') {
      onNotificationClick()
    }
  }

  const isCollapsed = isSearchMode || isNotificationMode;
  // const loggedInUser = JSON.parse(localStorage.getItem('user'));

  return (
    <div className={`flex flex-col h-screen fixed bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-1/5'
    }`}>
      {/* Instagram Logo */}
      <div className={`justify-left font-playwrite text-3xl font-bold p-3 hover:cursor-pointer border-b mt-5 border-gray-100 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
        {isCollapsed&&<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-8 h-8 mr-2">
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
        </svg>}
        {!isCollapsed && (
           <img
           src={instagramLogo}
           className="ml-3 object-contain pl-0"
           style={{ height: '40px', width: 'auto', filter: 'brightness(0) '   }}
         />
        )}
      </div>
      {/* Sidebar Items */}
      <div className='flex flex-col font-roboto font-normal flex-1  py-4'>
        {sidebarItems.map((item, index) => {
          let path = item.path;
          let linkState = undefined;
          if (item.name === 'Profile' && user && user.userId) {
            path = `/profile/${user.userId}`;
            linkState = { user: user };
          }
                              // Only highlight overlay icon if overlay is open, otherwise highlight current route
          let isActive = false;

          
          if (!noSidebarSelection) {
            if (isSearchMode && item.name === 'Search') isActive = true;
            else if (isNotificationMode && item.name === 'Notifications') isActive = true;
            else if (!isSearchMode && !isNotificationMode && item.path) {
              // Special handling for profile path which is dynamic
              if (item.name === 'Profile') {
                                // Only highlight Profile if it's the logged-in user's own profile
               if (user && user.userId) {
                 isActive = location.pathname === `/profile/${user.userId}`;

               }
              } else {
                isActive = location.pathname === item.path;
              }
            }
          }

          const content = (
            <div
              className={`my-icon flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <i className={`${item.icon} inside-my-icon ${(isCollapsed) ? 'mr-0' : 'mr-3'} text-xl ${isActive ? 'font-bold' : ''}`}></i>
              {!isCollapsed && <span className={`text-base ${isActive ? 'font-bold' : ''}`}>{item.name}</span>}
            </div>
          );

          if (path) {
            return (
              <Link to={path} state={linkState} key={index} tabIndex={0} onClick={onCloseOverlays}>
                {content}
              </Link>
            );
          } else {
            return (
              <div key={index} onClick={() => handleItemClick(item.name)}>
                {content}
              </div>
            );
          }
        })}
      </div>
    </div>
  )
}

export default SideBar 