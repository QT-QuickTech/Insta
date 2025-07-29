import React, { useState, useEffect } from 'react';

function VideoCropper({ 
  selectedVideo, 
  onClose, 
  onConfirm, 
  videoDuration, 
  setVideoDuration 
}) {
  const [videoStartTime, setVideoStartTime] = useState(0);
  const [videoEndTime, setVideoEndTime] = useState(30);
  const [isCroppingVideo, setIsCroppingVideo] = useState(false);
  const [currentVideoDuration, setCurrentVideoDuration] = useState(0);

  useEffect(() => {
    if (videoDuration) {
      setCurrentVideoDuration(videoDuration);
      setVideoEndTime(Math.min(30, videoDuration)); 
    }
  }, [videoDuration]);

  const handleVideoCropSave = () => {
    setIsCroppingVideo(true);
    
    const video = document.createElement('video');
    video.src = selectedVideo;
    video.muted = true;
    
    // Create MediaRecorder to capture the trimmed video
    const stream = video.captureStream();
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    const chunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const croppedVideoUrl = URL.createObjectURL(blob);
      onConfirm(croppedVideoUrl, videoStartTime, videoEndTime);
      setIsCroppingVideo(false);
    };
    
    mediaRecorder.onerror = () => {
      alert('Error cropping video. Please try again.');
      setIsCroppingVideo(false);
    };
    
    video.addEventListener('loadedmetadata', () => {
      // Set the start time
      video.currentTime = videoStartTime;
      
      video.addEventListener('seeked', () => {
        // Start recording
        mediaRecorder.start();
        
        // Play the video
        video.play();
        
        // Stop recording after the specified duration
        setTimeout(() => {
          mediaRecorder.stop();
          video.pause();
        }, (videoEndTime - videoStartTime) * 1000);
      });
    });
  };

  const handleStartTimeChange = (e) => {
    const start = parseFloat(e.target.value);
    setVideoStartTime(start);
    // Ensure end time maintains minimum 5 seconds and maximum 30 seconds
    const minEndTime = start + 5;
    const maxEndTime = Math.min(start + 30, currentVideoDuration);
    const newEndTime = Math.max(minEndTime, Math.min(videoEndTime, maxEndTime));
    setVideoEndTime(newEndTime);
  };

  const handleEndTimeChange = (e) => {
    const end = parseFloat(e.target.value);
    setVideoEndTime(end);
  };

  const selectedDuration = videoEndTime - videoStartTime;
  const isValidDuration = selectedDuration >= 5 && selectedDuration <= 30;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white w-[90%] h-[90%] flex rounded-lg overflow-hidden shadow-lg relative">
        
        {/* Video Preview */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <video 
            src={selectedVideo} 
            controls 
            className="w-full h-full object-contain bg-black"
            onLoadedMetadata={(e) => {
              if (!currentVideoDuration) {
                const duration = e.target.duration;
                setCurrentVideoDuration(duration);
                setVideoEndTime(Math.min(30, duration));
                setVideoDuration(duration);
              }
            }}
          />
        </div>
        
        {/* Right: Trim Controls */}
        <div className="w-[400px] flex flex-col border-l border-gray-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Trim Video</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full flex items-center justify-center transition-colors duration-200"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col gap-4 p-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-800">Select Duration (5-30 seconds)</h3>
            
            {/* Time Range Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time: {videoStartTime.toFixed(1)}s
                </label>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, currentVideoDuration - 5)}
                  step={0.1}
                  value={videoStartTime}
                  onChange={handleStartTimeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time: {videoEndTime.toFixed(1)}s
                </label>
                <input
                  type="range"
                  min={videoStartTime + 5}
                  max={Math.min(videoStartTime + 30, currentVideoDuration)}
                  step={0.1}
                  value={videoEndTime}
                  onChange={handleEndTimeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
            
            {/* Duration Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Selected Duration: </span>
                  <span className={`text-lg font-bold ${
                    isValidDuration ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedDuration.toFixed(1)} seconds
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Total: {currentVideoDuration.toFixed(1)}s
                </div>
              </div>
              
              {!isValidDuration && (
                <div className="text-sm text-red-600">
                  {selectedDuration < 5 ? '⚠️ Minimum duration is 5 seconds' : '⚠️ Maximum duration is 30 seconds'}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                onClick={onClose}
                disabled={isCroppingVideo}
              >
                Cancel
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                  isCroppingVideo || !isValidDuration
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={handleVideoCropSave}
                disabled={isCroppingVideo || !isValidDuration}
              >
                {isCroppingVideo ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm Trim'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Slider Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
          outline: none;
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
        
        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
}

export default VideoCropper; 