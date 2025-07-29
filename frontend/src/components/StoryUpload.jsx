import React, { useRef, useState } from 'react';
import { getUser, cloudUpload, setStory } from '../service/Api';
import defaultProfilePicture from '../images/Profile.webp';
import 'cropperjs/dist/cropper.css';
import VideoCropper from './VideoCropper';
import ImageCropper from './ImageCropper';

function StoryUpload({ onClose }) {
  const user = getUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState('image');
  const [isUploading, setIsUploading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [showVideoCropper, setShowVideoCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedVideo, setCroppedVideo] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFileType(file.type.startsWith('video/') ? 'video' : 'image');
      setCroppedImage(null);
      setCroppedVideo(null);
      if (file.type.startsWith('image/')) {
        setShowCropper(true);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.onloadedmetadata = () => {
          setVideoDuration(video.duration);
          if (video.duration > 30 || video.duration < 5) {
            setShowVideoCropper(true);
          }
        };
        video.src = URL.createObjectURL(file);
      }
    }
  };

  const handleCropSave = async (croppedUrl) => {
    setCroppedImage(croppedUrl);
    setShowCropper(false);
  };

  const handleRecrop = () => {
    setShowCropper(true);
    if (croppedImage) {
      setPreviewUrl(croppedImage);
    }
  };

  const handleVideoCropConfirm = (croppedVideoUrl) => {
    setCroppedVideo(croppedVideoUrl);
    setShowVideoCropper(false);
  };

  const handleVideoRecrop = () => {
    setShowVideoCropper(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    let fileToUpload = null;
    let uploadType = fileType;
    if (fileType === 'image') {
      fileToUpload = croppedImage || previewUrl;
      uploadType = 'image';
    } else if (fileType === 'video') {
      fileToUpload = croppedVideo || previewUrl;
      uploadType = 'video';
    }
    async function urlToBlob(url) {
      const res = await fetch(url);
      return await res.blob();
    }
    if (fileToUpload && typeof fileToUpload === 'string' && fileToUpload.startsWith('blob:')) {
      fileToUpload = await urlToBlob(fileToUpload);
    }
    setIsUploading(true);
    try {
      const url = await cloudUpload(fileToUpload, uploadType);
      const storyRequest = {
        storyUrl: url,
        storyType: uploadType,
        caption: caption,
        userId: user?.userId || null,
      };
      const response = await setStory(storyRequest);
      setIsUploading(false);
      setModalMessage(response.message);
      setShowModal(true);
    } catch (err) {
      setIsUploading(false);
      setModalMessage('Failed to upload story. See console for details.');
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileType('image');
    setCroppedImage(null);
    setCroppedVideo(null);
    setShowCropper(false);
    setShowVideoCropper(false);
    setCaption("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl mx-2 flex flex-col items-center relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={handleClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-2 text-center">Upload Story</h2>
        <input
          type="file"
          accept="image/*,video/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {!selectedFile && (
          <div className="flex flex-col items-center mb-4 w-full">
            <img
              src={user?.profilePicture || defaultProfilePicture}
              onError={e => e.target.src = defaultProfilePicture}
              alt="user"
              className="w-12 h-12 rounded-full mb-2"
            />
            <span className="font-semibold mb-2">{user?.username || 'Your Username'}</span>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-600 transition-colors duration-200 mb-2"
              onClick={handleFileClick}
            >
              Select Image/Video
            </button>
          </div>
        )}
        {(selectedFile && !showCropper && !showVideoCropper) && (
          <div className="w-full flex flex-row h-[70vh]">
            {/* Left: Preview */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
              {fileType === 'image' && (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <img src={croppedImage || previewUrl} alt="Preview" className="w-full h-full object-contain bg-black" />
                  <div className="absolute top-2 right-4 flex gap-2 z-10">
                    <button
                      className="px-4 py-2 bg-transparent text-white border border-white rounded-md hover:bg-white hover:text-black transition"
                      onClick={handleFileClick}
                    >
                      Change File
                    </button>
                    <button
                      className="px-4 py-2 bg-transparent text-white border border-white rounded-md hover:bg-white hover:text-black transition"
                      onClick={handleRecrop}
                    >
                      Crop
                    </button>
                  </div>
                </div>
              )}
              {fileType === 'video' && (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <video src={croppedVideo || previewUrl} controls className="w-full h-full object-contain bg-black" />
                  <div className="absolute top-2 right-4 flex gap-2 z-10">
                    <button
                      className="px-4 py-2 bg-transparent text-white border border-white rounded-md hover:bg-white hover:text-black transition"
                      onClick={handleFileClick}
                    >
                      Change File
                    </button>
                    <button
                      className="px-4 py-2 bg-transparent text-white border border-white rounded-md hover:bg-white hover:text-black transition"
                      onClick={handleVideoRecrop}
                    >
                      Crop Video
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Right: Caption Form */}
            <div className="w-[400px] flex flex-col border-l border-gray-200 bg-white">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.profilePicture || defaultProfilePicture}
                    className="w-8 h-8 rounded-full"
                    alt="user"
                  />
                  <span className="font-semibold">{user?.username || "Your Username"}</span>
                </div>
                <button onClick={handleClose} aria-label="Close">
                  <span className="text-2xl text-gray-400 hover:text-gray-700 font-bold">&times;</span>
                </button>
              </div>
              <form onSubmit={handleUpload} className="flex flex-col gap-3 p-4 flex-1">
                <label className="font-medium text-gray-700">Caption</label>
                <textarea
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[80px]"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 mt-4"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Story'}
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Image Cropper Overlay */}
        {previewUrl && showCropper && fileType === 'image' && (
          <ImageCropper
            image={previewUrl}
            onConfirm={handleCropSave}
            onClose={handleClose}
          />
        )}
        {/* Video Cropper Overlay */}
        {previewUrl && showVideoCropper && fileType === 'video' && (
          <VideoCropper
            selectedVideo={previewUrl}
            onClose={() => setShowVideoCropper(false)}
            onConfirm={handleVideoCropConfirm}
            videoDuration={videoDuration}
            setVideoDuration={setVideoDuration}
          />
        )}
        {showModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
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
        {isUploading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60">
            <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-xl">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span className="text-lg font-semibold text-gray-700">Uploading your story...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryUpload; 