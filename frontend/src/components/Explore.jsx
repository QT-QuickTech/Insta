import React, { useState, useEffect, useRef } from 'react';
import { FaPlayCircle } from "react-icons/fa";
import PostInfo from './PostInfo';
import { getFeeds } from '../service/Api';
import defaultImage from '../images/mockImage.jpg';
import defaultVideo from '../images/mockVideo.mp4';

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export default function Explore() {
  const [page, setPage] = useState(0);
  const [showPostInfo, setShowPostInfo] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postChunks, setPostChunks] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setPostChunks(prev => [...prev, ...chunkArray(data, 5)]);
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

  const renderPost = (item, style = {}) => (
    <div
      className="relative overflow-hidden w-full group cursor-pointer"
      style={style}
      onClick={() => {
        setSelectedPost(item);
        setShowPostInfo(true);
      }}
    >
      {item.mediaType === "video" ? (
        <>
          <video
            src={item.mediaUrl }
            className="object-cover w-full h-full"
            muted
            playsInline
            loop
            onError={e => e.target.src = defaultVideo}
          />
          <FaPlayCircle className="absolute top-2 right-2 text-white text-2xl drop-shadow" />
        </>
      ) : (
        <img
          src={item.mediaUrl}
          alt={`Explore ${item.userId}`}
          className="w-full h-full object-cover"
          onError={e => e.target.src = defaultImage}
        />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex space-x-4 text-white text-lg font-semibold">
          <span className="flex items-center">
            <i className="fa-solid fa-heart mr-2"></i>
            {item.likes || 100}
          </span>
          <span className="flex items-center">
            <i className="fa-solid fa-comment mr-2"></i>
            {item.comments || 10}
          </span>
        </div>
      </div>
    </div>
  );

  const singleHeight = { height: 250 };
  const doubleHeight = { height: 500 };

  return (<>
    {showPostInfo && selectedPost && (
      <PostInfo
        post={selectedPost}
        imageUrls={[selectedPost.mediaUrl]}
        onClose={() => setShowPostInfo(false)}
      />
    )}
    <div className="p-4">
      {loading ? (
        Array.from({ length: 2 }).map((_, rowIdx) => (
          <div
            key={`explore-loader-row-${rowIdx}`}
            className="mb-2 grid grid-cols-3 grid-rows-2 gap-2"
            style={{ minHeight: 200, maxHeight: 500 }}
          >
            {Array.from({ length: 5 }).map((_, colIdx) => (
              <div
                key={`explore-loader-cell-${rowIdx}-${colIdx}`}
                className={
                  colIdx === 4
                    ? "bg-gray-200 animate-pulse rounded-lg col-start-3 row-start-1 row-span-2"
                    : "bg-gray-200 animate-pulse rounded-lg"
                }
                style={colIdx === 4 ? { height: 500 } : { height: 250 }}
              />
            ))}
          </div>
        ))
      ) : (
        postChunks.map((chunk, idx) => (
          <div
            key={idx}
            className="mb-2 grid grid-cols-3 grid-rows-2 gap-2"
            style={{ minHeight: 200, maxHeight: 500 }}
          >
            {idx % 2 === 0 ? (
              // Even: tall post on right
              <>
                {chunk[0] && <div className="row-start-1 col-start-1" style={singleHeight}>{renderPost(chunk[0], singleHeight)}</div>}
                {chunk[1] && <div className="row-start-1 col-start-2" style={singleHeight}>{renderPost(chunk[1], singleHeight)}</div>}
                {chunk[2] && <div className="row-start-2 col-start-1" style={singleHeight}>{renderPost(chunk[2], singleHeight)}</div>}
                {chunk[3] && <div className="row-start-2 col-start-2" style={singleHeight}>{renderPost(chunk[3], singleHeight)}</div>}
                {chunk[4] && (
                  <div className="row-start-1 row-span-2 col-start-3" style={doubleHeight}>
                    {renderPost(chunk[4], doubleHeight)}
                  </div>
                )}
              </>
            ) : (
              // Odd: tall post on left
              <>
                {chunk[4] && (
                  <div className="row-start-1 row-span-2 col-start-1" style={doubleHeight}>
                    {renderPost(chunk[4], doubleHeight)}
                  </div>
                )}
                {chunk[0] && <div className="row-start-1 col-start-2" style={singleHeight}>{renderPost(chunk[0], singleHeight)}</div>}
                {chunk[1] && <div className="row-start-1 col-start-3" style={singleHeight}>{renderPost(chunk[1], singleHeight)}</div>}
                {chunk[2] && <div className="row-start-2 col-start-2" style={singleHeight}>{renderPost(chunk[2], singleHeight)}</div>}
                {chunk[3] && <div className="row-start-2 col-start-3" style={singleHeight}>{renderPost(chunk[3], singleHeight)}</div>}
              </>
            )}
          </div>
        ))
      )}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {!hasMore && <div className="text-center py-4 text-gray-400">No more posts</div>}
    </div>
  </>);
}
