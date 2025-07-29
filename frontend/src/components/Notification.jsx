import React, { useEffect, useState } from 'react'
import {  notifications as notify} from '../service/DB';
import {  getNotifications, acceptRequest, deleteRequest } from '../service/Api';
import {  useNavigate } from 'react-router-dom';


function Notification(props) {
  const navigate = useNavigate();
  const [notifications,setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState({});

    useEffect(()=>{
      loadNotifications(0, true);
    }, []);

    const loadNotifications = async (page, reset = false) => {
      setLoading(true);
      try {
        const response = await getNotifications(page);
        const newNotifications = response.content || response;
        
        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        // Check if there are more pages
        if (response.content) {
          setHasMore(!response.last);
        } else {
          setHasMore(newNotifications.length === 10); // Assuming 10 is the page size
        }
        
        setCurrentPage(page);
      } catch (error) {
        console.error('Error loading notifications:', error);
        if (reset) {
          setNotifications(notify);
        }
      } finally {
        setLoading(false);
      }
    };

    const handleLoadMore = () => {
      if (!loading && hasMore) {
        loadNotifications(currentPage + 1, false);
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
  console.log(notifications);

  // Utility function to format 'time ago'
  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
    return "just now";
  }

  // Utility function to get icon for each notification type
  function getTypeIcon(type) {
    switch (type) {
      case "comment":
        return "💬";
      case "like":
        return "❤️";
      case "follow":
        return "👀";
      case "request":
        return "🔔";
      case "tag":
        return "🏷️";
      case "accept":
        return "🤝";
      default:
        return "🔔";
    }
  }

  // Handler for accepting a request
  function accept(notif) {
    setRequestStatus(prev => ({ ...prev, [notif.id]: 'accepted' }));
    console.log('Accept request:', notif);
    acceptRequest(notif.user.userId);
  }

  // Handler for cancelling a request
  function cancel(notif) {
    setRequestStatus(prev => ({ ...prev, [notif.id]: 'canceled' }));
    console.log('Cancel request:', notif);
    deleteRequest(notif.user.userId);
  }

  return (
    <div className="fixed bg-white shadow-xl rounded-r-2xl flex flex-col" style={{minWidth: '200px',height: '100vh', maxHeight: '100vh', maxWidth: '450px'}}>
      <div className="p-8 pb-0">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => handleUserClick(notif.user.userId, notif.user)}>
              <div className="flex items-center" style={{ cursor: 'pointer' }}>
                <img
                  src={notif.user.profilePicture}
                  alt={notif.user.userId}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
               
              </div>
              <div className="flex-1 items-center">
                <span className="font-semibold text-sm mr-1">{notif.user.userId}</span>
                <span className="text-sm text-gray-400">{notif.user.username}</span>
                <br />
                <span className="text-sm  ">{notif.text}</span>
                {notif.type === "comment" && <span className="text-sm"> on your post </span>} 
                <span className="text-lg mr-3">{getTypeIcon(notif.type)}</span>
                <div className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</div>
                {notif.type === "request" && (
                  <div className="flex gap-2 mt-2">
                    {requestStatus[notif.id] === 'accepted' ? (
                      <button className="px-2 py-0.5 bg-white border border-gray-400 text-gray-500 rounded cursor-default text-xs">Accepted</button>
                    ) : requestStatus[notif.id] === 'canceled' ? (
                      <button className="px-2 py-0.5 bg-white border border-gray-400 text-gray-500 rounded cursor-default text-xs">Canceled</button>
                    ) : (
                      <>
                        <button
                          className="px-2 py-0.5 bg-white border border-gray-400 text-blue-500 rounded hover:bg-gray-100 text-xs"
                          onClick={e => { e.stopPropagation(); accept(notif); }}
                        >
                          Accept
                        </button>
                        <button
                          className="px-2 py-0.5 bg-white border border-gray-400 text-gray-500 rounded hover:bg-gray-100 text-xs"
                          onClick={e => { e.stopPropagation(); cancel(notif); }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {hasMore && (
            <div className="flex justify-center ">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className=" text-slate-400  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'See More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notification 