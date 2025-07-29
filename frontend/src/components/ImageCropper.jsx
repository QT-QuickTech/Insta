import React, { useRef, useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

function ImageCropper({ image, onConfirm, onClose }) {
  const cropperRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  const handleConfirm = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        canvas.toBlob(blob => {
          if (blob) {
            const croppedUrl = URL.createObjectURL(blob);
            onConfirm(croppedUrl);
          }
        }, 'image/jpeg');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white w-[90vw] h-[90vh] flex flex-row rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Left: Image Cropper */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <Cropper
            src={image}
            style={{ height: '100%', width: '100%' }}
            aspectRatio={1}
            guides={false}
            viewMode={1}
            dragMode="move"
            cropBoxResizable={true}
            cropBoxMovable={true}
            zoomTo={zoom}
            onZoom={e => setZoom(e.detail.ratio)}
            autoCropArea={1}
            background={false}
            responsive={true}
            checkOrientation={false}
            ref={cropperRef}
          />
        </div>
        {/* Right: Controls */}
        <div className="w-[350px] flex flex-col items-center justify-center p-8 bg-white border-l border-gray-200 h-full">
          <h2 className="text-xl font-bold mb-6 text-center">Crop Image</h2>
          <label className="flex items-center gap-2 mb-6">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
            />
          </label>
          <button
            className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            onClick={handleConfirm}
            type="button"
          >
            Confirm
          </button>
          <button
            className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors duration-200"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper; 