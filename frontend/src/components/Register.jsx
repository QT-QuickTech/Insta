import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, cloudUpload } from '../service/Api';
import defaultProfilePicture from '../images/profile.webp';
import ImageCropper from './ImageCropper';

const Register = () => {
  // Form state
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState('');
  const [preview, setPreview] = useState(defaultProfilePicture);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const fileInputRef = useRef(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const navigate = useNavigate();

  // Handle profile picture selection
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCropperImage(URL.createObjectURL(file));
    setShowCropper(true);
  };

  // Handle cropped image confirmation
  const handleCropConfirm = async (croppedUrl) => {
    setShowCropper(false);
    setUploading(true);
    setPreview(croppedUrl);
    try {
      const blob = await fetch(croppedUrl).then(r => r.blob());
      const url = await cloudUpload(blob, 'image');
      setProfilePicture(url);
    } catch (err) {
      setError('Failed to upload profile picture.');
      setShowMessage(true);
      setPreview(defaultProfilePicture);
      setProfilePicture('');
    } finally {
      setUploading(false);
    }
  };

  // Open file picker
  const handleProfilePicClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess('');
    setShowMessage(false);

    // Validation for minimum 5 characters
    if (userId.length < 5) {
      setError('User ID must contain at least 5 characters.');
      setShowMessage(true);
      return;
    }

    if (userName.length < 5) {
      setError('User Name must contain at least 5 characters.');
      setShowMessage(true);
      return;
    }

    if (email.length < 5) {
      setError('Email must contain at least 5 characters.');
      setShowMessage(true);
      return;
    }

    if (password.length < 5) {
      setError('Password must contain at least 5 characters.');
      setShowMessage(true);
      return;
    }

    if (confirmPassword.length < 5) {
      setError('Confirm Password must contain at least 5 characters.');
      setShowMessage(true);
      return;
    }

    // Validation
    if (userId.includes(' ')) {
      setError('User ID should not contain spaces.');
      setShowMessage(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setShowMessage(true);
      return;
    }

    setLoading(true);
    
    try {
      const data = await registerUser({
        userId: userId,
        username: userName,
        email: email,
        password: password,
        bio: bio,
        profilePicture: profilePicture || '',
        isPrivate: isPrivate,
      });

      if (data) {
        if (data.message === 'User is created successfully' || data.success === true || data.status === 'success') {
          setSuccess('Registration successful! Click OK to continue to login.');
          setShowMessage(true);
        } else {
          setError(data.message || data.error || 'Registration failed');
          setShowMessage(true);
        }
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      setShowMessage(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-pink-200 via-purple-200 to-blue-200">
      {/* Overlay for loading, errors, and success */}
      {(loading || uploading || showMessage) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center w-[90vw] max-w-sm border border-gray-200">
            {/* Icon */}
            {loading || uploading ? (
              <svg className="animate-spin h-14 w-14 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : error ? (
              <svg className="h-14 w-14 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fee2e2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" /></svg>
            ) : success ? (
              <svg className="h-14 w-14 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#dcfce7"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg>
            ) : null}

            {/* Message */}
            {error && (
              <div className="text-red-600 text-center text-lg font-semibold mb-2">{error}</div>
            )}
            {success && (
              <div className="text-green-600 text-center text-lg font-semibold mb-2">{success}</div>
            )}
            {!error && !success && (loading || uploading) && (
              <div className="text-blue-600 text-center text-lg font-semibold mb-2">{loading ? 'Registering...' : 'Uploading...'}</div>
            )}

            {/* OK Button */}
            {!loading && !uploading && (error || success) && (
              <button
                onClick={() => {
                  const wasSuccess = !!success;
                  setShowMessage(false);
                  setError('');
                  setSuccess('');
                  if (wasSuccess) {
                    navigate('/login');
                  }
                }}
                className="mt-4 px-8 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow"
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className="flex flex-col items-center bg-white p-10 rounded-2xl shadow-2xl w-96">
        <div className="mb-8 flex flex-col items-center">
          {/* Profile Picture Upload */}
          <div className="relative mb-4">
            <img
              src={preview}
              alt="Profile"
              className="w-20 h-20 rounded-full border-2 border-gray-300 object-cover"
            />
            <button
              type="button"
              onClick={handleProfilePicClick}
              className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center border-2 border-white shadow hover:bg-blue-600 transition p-0"
              title="Change profile picture"
              disabled={uploading || loading}
              style={{ lineHeight: 1 }}
            >
              <i className="bi bi-plus-circle-fill text-lg flex items-center justify-center w-full h-full"></i>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleProfilePicChange}
              disabled={uploading || loading}
            />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">Sign Up</h2>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={e => setUserId(e.target.value.replace(/\s/g, ''))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="username"
            required
            disabled={loading}
          />
          
          <input
            type="text"
            placeholder="User Name"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            disabled={loading}
          />
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="email"
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="new-password"
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="new-password"
            required
            disabled={loading}
          />
          
          <textarea
            placeholder="Bio (optional)"
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={2}
            disabled={loading}
          />
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
              disabled={loading}
            />
            <span className="text-gray-700">Private Account</span>
          </label>
          
          <button
            className={`w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:from-pink-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={loading || uploading}
          >
            {loading ? 'Registering...' : uploading ? 'Uploading...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-gray-500 text-sm text-center">
          Already have an account?{' '}
          <button
            className="text-blue-600 hover:underline"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Log In
          </button>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          image={cropperImage}
          onConfirm={handleCropConfirm}
          onClose={() => setShowCropper(false)}
        />
      )}
    </div>
  );
};

export default Register;