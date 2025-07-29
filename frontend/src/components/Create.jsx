import React, { useRef, useState, useCallback } from 'react';
import VideoCropper from './VideoCropper';
import TagInput from './TagInput';
import { getUser, cloudUpload ,setPost} from '../service/Api';
import defaultProfilePicture from '../images/Profile.webp';
import ImageCropper from './ImageCropper';

function Create() {
  const user = getUser();
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [croppedVideo, setCroppedVideo] = useState(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [postType, setPostType] = useState("image"); // "image" or "video"
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showVideoCropper, setShowVideoCropper] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPost, setPendingPost] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleImageClick = () => {
    imageInputRef.current.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current.click();
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('=== IMAGE UPLOAD ===');
      console.log('File:', file);
      console.log('File Name:', file.name);
      console.log('File Size:', file.size, 'bytes');
      console.log('File Type:', file.type);
      console.log('Post Type:', 'image');
      console.log('User:', user);
      console.log('=== END IMAGE UPLOAD ===');
      
      setSelectedImage(URL.createObjectURL(file));
      setSelectedVideo(null);
      setPostType("image");
      setShowCropper(true);
      setCroppedImage(null);
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      console.log('=== VIDEO/REEL UPLOAD ===');
      console.log('File:', file);
      console.log('File Name:', file.name);
      console.log('File Size:', file.size, 'bytes');
      console.log('File Type:', file.type);
      console.log('Post Type:', 'video/reel');
      console.log('User:', user);
      console.log('=== END VIDEO UPLOAD ===');
      
      // Check file type
      if (!file.type.startsWith('video/')) {
        setModalMessage('Please select a valid video file.');
        setShowModal(true);
        return;
      }
      
      // Check file size (optional - 100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setModalMessage('Video file is too large. Please select a smaller file (max 100MB).');
        setShowModal(true);
        return;
      }
      
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true; // Required for some browsers
      
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded, duration:', video.duration);
        
        // Check if duration is valid
        if (video.duration && !isNaN(video.duration) && video.duration > 0) {
          setVideoDuration(video.duration);
          
          if (video.duration > 30) {
            // Show video cropper for long videos
            console.log('Video is longer than 30s, opening cropper');
            setSelectedVideo(URL.createObjectURL(file));
            setSelectedImage(null);
            setPostType("video");
            setCroppedImage(null);
            setShowCropper(false);
            setShowVideoCropper(true);
          } else if (video.duration < 5) {
            // Show error for videos shorter than 5 seconds
            setModalMessage('Video must be at least 5 seconds long. Please select a longer video.');
            setShowModal(true);
            return;
          } else {
            // Use video as is if it's already 5-30 seconds
            console.log('Video is 5-30s, using as-is');
            setSelectedVideo(URL.createObjectURL(file));
            setSelectedImage(null);
            setPostType("video");
            setCroppedImage(null);
            setShowCropper(false);
            setCroppedVideo(null);
          }
        } else {
          // Fallback: assume video is valid and let user proceed
          console.log('Duration not available, proceeding with video');
          setSelectedVideo(URL.createObjectURL(file));
          setSelectedImage(null);
          setPostType("video");
          setCroppedImage(null);
          setShowCropper(false);
          setCroppedVideo(null);
        }
      };
      
      video.onerror = (error) => {
        console.error('Error loading video:', error);
        setModalMessage('Error loading video. Please try a different video file.');
        setShowModal(true);
      };
      
      // Add timeout fallback
      const timeout = setTimeout(() => {
        console.log('Video metadata loading timeout, proceeding with video');
        setSelectedVideo(URL.createObjectURL(file));
        setSelectedImage(null);
        setPostType("video");
        setCroppedImage(null);
        setShowCropper(false);
        setCroppedVideo(null);
      }, 5000); // 5 second timeout
      
      video.onloadedmetadata = () => {
        clearTimeout(timeout); // Clear timeout if metadata loads successfully
        console.log('Video metadata loaded, duration:', video.duration);
        
        // Check if duration is valid
        if (video.duration && !isNaN(video.duration) && video.duration > 0) {
          setVideoDuration(video.duration);
          
          if (video.duration > 30) {
            // Show video cropper for long videos
            console.log('Video is longer than 30s, opening cropper');
            setSelectedVideo(URL.createObjectURL(file));
            setSelectedImage(null);
            setPostType("video");
            setCroppedImage(null);
            setShowCropper(false);
            setShowVideoCropper(true);
          } else if (video.duration < 5) {
            // Show error for videos shorter than 5 seconds
            setModalMessage('Video must be at least 5 seconds long. Please select a longer video.');
            setShowModal(true);
            return;
          } else {
            // Use video as is if it's already 5-30 seconds
            console.log('Video is 5-30s, using as-is');
            setSelectedVideo(URL.createObjectURL(file));
            setSelectedImage(null);
            setPostType("video");
            setCroppedImage(null);
            setShowCropper(false);
            setCroppedVideo(null);
          }
        } else {
          // Fallback: assume video is valid and let user proceed
          console.log('Duration not available, proceeding with video');
          setSelectedVideo(URL.createObjectURL(file));
      setSelectedImage(null);
          setPostType("video");
      setCroppedImage(null);
      setShowCropper(false);
          setCroppedVideo(null);
        }
      };
      
      video.src = URL.createObjectURL(file);
    }
  };

  const handlePost = (e) => {
    e.preventDefault();
    setShowConfirm(true);
    setPendingPost(true);
  };



  const handleConfirmPost = async () => {
    // Parse tags from string to array
    const parseTags = (tagString) => {
      return tagString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    };

    let cloudinaryUrl = null;
    let fileToUpload = null;
    let fileType = null;
    // Determine which file/blob to upload
    if (postType === "image") {
      fileToUpload = croppedImage || selectedImage;
      fileType = "image";
    } else if (postType === "video") {
      fileToUpload = croppedVideo || selectedVideo;
      fileType = "video";
    }

    // Convert blob URL to File/Blob if needed
    async function urlToBlob(url) {
      const res = await fetch(url);
      return await res.blob();
    }

    if (fileToUpload) {
      let uploadBlob = fileToUpload;
      // If it's a blob URL, fetch and convert to Blob
      if (typeof fileToUpload === "string" && fileToUpload.startsWith("blob:")) {
        uploadBlob = await urlToBlob(fileToUpload);
      }
      try {
        setIsUploading(true);
        console.log(`Uploading ${fileType} to Cloudinary...`);
        cloudinaryUrl = await cloudUpload(uploadBlob, fileType);
        console.log(`Cloudinary ${fileType} URL:`, cloudinaryUrl);
      } catch (err) {
        setIsUploading(false);
        setModalMessage('Failed to upload to Cloudinary. See console for details.');
        setShowModal(true);
        return;
      }
    }
    setIsUploading(false);

    // Create post object based on type
    const postObject = {
      userId: user?.userId || null,
      mediaType: postType,
      caption: caption,
      tags: parseTags(tags),

      ...(postType === "image"
        ? {
          mediaUrl: cloudinaryUrl || croppedImage || selectedImage,
          }
        : {
          mediaUrl: cloudinaryUrl || croppedVideo || selectedVideo,
          }),
    };


    console.log("File Inputs:", {
      imageInputRef: imageInputRef.current?.value,
      videoInputRef: videoInputRef.current?.value,
    });
    // Log the structured post object
    console.log("=== STRUCTURED POST OBJECT ===");
    console.log("Post Object:", postObject);
    setPost(postObject);
    console.log("=== END POST DATA ===");

    setModalMessage(`Post created!\nCaption: ${caption}\nTags: ${tags}`);
    setShowModal(true);
    setSelectedImage(null);
    setSelectedVideo(null);
    setCroppedImage(null);
    setCroppedVideo(null);
    setVideoDuration(0);
    setCaption("");
    setTags("");
    setShowCropper(false);
    setShowVideoCropper(false);
    setShowConfirm(false);
    setPendingPost(false);
    // Clear file input values
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleCloseConfirm = () => {
    setShowConfirm(false);
    setPendingPost(false);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setCroppedImage(null);
    setCroppedVideo(null);
    setVideoDuration(0);
    setCaption("");
    setTags("");
    setShowCropper(false);
    setShowVideoCropper(false);
    
    // Clear file input values so the same file can be selected again
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Helper to get cropped image
  const getCroppedImg = async (imageSrc, cropPixels) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    });
  };

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });
  }

  // Update handleCropSave to accept croppedUrl
  const handleCropSave = async (croppedUrl) => {
    setCroppedImage(croppedUrl);
    setShowCropper(false);
  };

  // Add a handler to re-crop
  const handleRecrop = () => {
    setShowCropper(true);
    // If already cropped, use the cropped image as the source for cropping
    if (croppedImage) {
      setSelectedImage(croppedImage);
    }
  };

  // Video cropping handlers
  const handleVideoCropConfirm = (croppedVideoUrl, startTime, endTime) => {
    setCroppedVideo(croppedVideoUrl);
    setShowVideoCropper(false);
  };

  const handleVideoRecrop = () => {
    setShowVideoCropper(true);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
      {/* Loader Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60">
          <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-xl">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-lg font-semibold text-gray-700">Uploading your post...</span>
          </div>
        </div>
      )}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md mx-2">
        <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-800">Create a New Post</h1>
        <p className="text-gray-500 text-center mb-6">Share your moments with your friends!</p>
        
        <div className="flex justify-center gap-4 mb-6">
          <button
            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-600 transition-colors duration-200"
            onClick={handleImageClick}
          >
            Upload Post
          </button>
          <button
            className="px-5 py-2 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-600 transition-colors duration-200"
            onClick={handleVideoClick}
          >
            Upload Reel
          </button>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        <input
          type="file"
          accept="video/mp4,video/webm,video/ogg,video/avi,video/mov,video/wmv,video/flv,video/mkv"
          ref={videoInputRef}
          style={{ display: 'none' }}
          onChange={handleVideoChange}
        />
        <div className="border-t border-gray-200 my-6"></div>
        <div className="mt-4">
          {!croppedImage && !selectedVideo && !croppedVideo && (
            <div className="flex flex-col items-center justify-center text-gray-400 py-10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v8.25M3 16.5A2.25 2.25 0 005.25 18.75h13.5A2.25 2.25 0 0021 16.5M3 16.5v-1.125c0-.621.504-1.125 1.125-1.125h15.75c.621 0 1.125.504 1.125 1.125V16.5" />
              </svg>
              <span className="text-lg">No file selected</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Image Cropper Overlay */}
      {selectedImage && showCropper && (
        <ImageCropper
          image={selectedImage}
          onConfirm={handleCropSave}
          onClose={handleCloseModal}
        />
      )}
      
      {/* Video Cropper Overlay */}
      {selectedVideo && showVideoCropper && (
        <VideoCropper
          selectedVideo={selectedVideo}
          onClose={handleCloseModal}
          onConfirm={handleVideoCropConfirm}
          videoDuration={videoDuration}
          setVideoDuration={setVideoDuration}
        />
      )}
      
      {/* Post Creation Overlay (after crop or for video) */}
      {(croppedImage || selectedVideo || croppedVideo) && !showCropper && !showVideoCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white w-[90%] h-[90%] flex rounded-lg overflow-hidden shadow-lg relative">
            {/* Left: Image/Video Preview */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
              {croppedImage && (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <img src={croppedImage} alt="Preview" className="w-full h-full object-contain bg-black" />
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition-colors duration-200"
                      onClick={handleImageClick}
                    >
                      Change Image
                    </button>
                    <button
                      className="px-3 py-1.5 bg-yellow-500 text-white rounded-full font-semibold shadow hover:bg-yellow-600 transition-colors duration-200"
                      onClick={handleRecrop}
                    >
                      Crop
                    </button>
                  </div>
                </div>
              )}
              {(selectedVideo || croppedVideo) && (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <video src={croppedVideo || selectedVideo} controls className="w-full h-full object-contain bg-black" />
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                      className="px-3 py-1.5 bg-green-600 text-white rounded-full font-semibold shadow hover:bg-green-700 transition-colors duration-200"
                    onClick={handleVideoClick}
                  >
                    Change Video
                  </button>
                    <button
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-full font-semibold shadow hover:bg-blue-600 transition-colors duration-200"
                      onClick={handleVideoRecrop}
                    >
                      Crop Video
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Right: Post Details Form */}
            <div className="w-[400px] flex flex-col border-l border-gray-200 bg-white">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.profilePicture || defaultProfilePicture}
                    className="w-8 h-8 rounded-full"
                    alt="user"
                  />
                  <span className="font-semibold">{user?.username || "Your Username"}</span>
                </div>
                <button onClick={handleCloseModal} aria-label="Close">
                  <span className="text-2xl text-gray-400 hover:text-gray-700 font-bold">&times;</span>
                </button>
              </div>
              {/* Form */}
              <form onSubmit={handlePost} className="flex flex-col gap-3 p-4 flex-1">
                <label className="font-medium text-gray-700">Caption</label>
                <textarea
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[80px]"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                />
                <TagInput 
                  tags={tags}
                  setTags={setTags}
                  placeholder="Tag users (@username)"
                  isUserTagging={true}
                />

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      postType === "image" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {postType === "image" ? "📷 post" : "🎥 reel"}
                    </span>
                  </div>
                <button
                  type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
                >
                  Post
                </button>
                </div>
              </form>
            </div>
          </div>
          {/* Confirmation Overlay */}
          {showConfirm && pendingPost && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Are you sure you want to post?</h2>
                <div className="flex gap-4">
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                    onClick={handleConfirmPost}
                  >
                    Confirm
                  </button>
                  <button
                    className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors duration-200"
                    onClick={handleCloseConfirm}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 flex flex-col items-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <div className="text-lg font-semibold mb-4 text-center whitespace-pre-line">{modalMessage}</div>
            <button
              className="mt-2 px-4 py-2 rounded bg-purple-500 text-white hover:bg-purple-600"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Create; 