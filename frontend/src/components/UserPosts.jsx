import React from 'react';
import { setUnsave ,removeTag,deletePost} from '../service/Api';
import defaultImage from '../images/mockImage.jpg';
import defaultVideo from '../images/mockVideo.mp4';

function UserPosts({ posts: initialPosts, setSelectedPost, setShowPostInfo, isOwnProfile, tab }) {
  const [posts, setPosts] = React.useState(initialPosts);
  React.useEffect(() => { setPosts(initialPosts); }, [initialPosts]);
  const [menuOpen, setMenuOpen] = React.useState(null);
  const justClosedMenuRef = React.useRef(false);
  const [confirmDelete, setConfirmDelete] = React.useState(null); // post to delete

  React.useEffect(() => {
    if (menuOpen !== null) {
      const handleClick = (e) => {
        // If the click is outside any menu, close it
        // We use a class on the menu to identify
        if (!e.target.closest('.userpost-menu-dropdown') && !e.target.closest('.userpost-menu-btn')) {
          setMenuOpen(null);
          justClosedMenuRef.current = true;
        }
      };
      document.addEventListener('pointerdown', handleClick);
      return () => document.removeEventListener('pointerdown', handleClick);
    }
  }, [menuOpen]);

  // Reset the justClosedMenuRef after each render
  React.useEffect(() => {
    if (justClosedMenuRef.current) {
      const id = setTimeout(() => { justClosedMenuRef.current = false; }, 0);
      return () => clearTimeout(id);
    }
  });
  
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <i className="fa-regular fa-image text-6xl mb-4" />
        <span className="text-lg">No posts</span>
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-3 gap-2 p-6 relative">
        {/* Overlay to block background interaction when menu is open */}
        {menuOpen !== null && (
          <div
            className="fixed inset-0 z-10"
            style={{ cursor: 'default' }}
            onClick={() => setMenuOpen(null)}
          />
        )}
        {posts.slice().reverse().map((post, i) => (
          <div
            key={ i}
            className="aspect-square bg-gray-100 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer"
            onClick={e => {
              // If menu is open, just close it and do nothing else (for any post)
              if (menuOpen !== null) {
                setMenuOpen(null);
                return;
              }
              // If menu was just closed, skip this click
              if (justClosedMenuRef.current) {
                return;
              }
              if (setSelectedPost) setSelectedPost(post);
              if (setShowPostInfo) setShowPostInfo(true);
            }}
          >
            {/* 3-dot menu for own profile */}
            {isOwnProfile && (
              <div className="absolute top-2 right-2 z-20">
                <div className="relative">
                  <button
                    className="text-white rounded-full p-1 hover:bg-opacity-70 focus:outline-none userpost-menu-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setMenuOpen(i => (typeof i === 'number' && i === post.postId) ? null : post.postId);
                    }}
                    aria-label="Post options"
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  {menuOpen === post.postId && (
                    <div className="absolute right-0 mt-2 w-28 bg-slate-50 rounded shadow-lg z-30 userpost-menu-dropdown">
                      {tab === 'tagged' ? (
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 text-slate-600 rounded hover:text-red-500 hover:bg-white"
                          onClick={e => {
                            e.stopPropagation();
                            setConfirmDelete({ post, action: 'remove' });
                            setMenuOpen(null);
                          }}
                        >
                          Remove
                        </button>
                      ) : tab === 'saved' ? (
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 text-slate-600 rounded hover:text-red-500 hover:bg-white"
                          onClick={e => {
                            e.stopPropagation();
                            setConfirmDelete({ post, action: 'unsave' });
                            setMenuOpen(null);
                          }}
                        >
                          Unsave
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 text-slate-600 rounded hover:text-red-500 hover:bg-white"
                          onClick={e => {
                            e.stopPropagation();
                            setConfirmDelete({ post, action: 'delete' });
                            setMenuOpen(null);
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {post.mediaType === 'video' ? (
              <video
                src={post.mediaUrl}
                className="object-cover w-full h-full"
                muted
                playsInline
                loop
                onError={e => e.target.src = defaultVideo}
              />
            ) : (
              <img
                src={post.mediaUrl}
                alt={`Post ${post.postId || i}`}
                className="object-cover w-full h-full"
                onError={e => e.target.src = defaultImage}
              />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex space-x-4 text-white text-lg font-semibold">
                <span className="flex items-center">
                  <i className="fa-solid fa-heart mr-2"></i>
                  {post.likes}
                </span>
                <span className="flex items-center">
                  <i className="fa-solid fa-comment mr-2"></i>
                  {Array.isArray(post.comments) ? post.comments.length : post.comments}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-center">
              {confirmDelete.action === 'remove' && 'Are you sure you want to remove this post from your tags?'}
              {confirmDelete.action === 'unsave' && 'Are you sure you want to unsave this post?'}
              {(!confirmDelete.action || confirmDelete.action === 'delete') && 'Are you sure you want to delete this post?'}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                   if(confirmDelete.action === 'remove'){
                      removeTag(confirmDelete.post.postId);
                    }
                    if(confirmDelete.action === 'unsave') setUnsave(confirmDelete.post.postId);
                    if(confirmDelete.action === 'delete') deletePost(confirmDelete.post.postId);
                    // Remove from posts array in UI
                    setPosts(prev => prev.filter(p => p.postId !== confirmDelete.post.postId));
                    setConfirmDelete(null);
                }}
              >
                {confirmDelete.action === 'remove' && 'Remove'}
                {confirmDelete.action === 'unsave' && 'Unsave'}
                {(!confirmDelete.action || confirmDelete.action === 'delete') && 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserPosts; 