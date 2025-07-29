import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Auto-logout after 3 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          performLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const performLogout = async () => {
    setLoading(true);
    try {
      // Clear user data from localStorage
      localStorage.removeItem('user');
      // localStorage.removeItem('token');
      
      // Clear any other session data
      sessionStorage.clear();
      
      // Simulate API call to logout (if you have a logout endpoint)
      // await fetch('/api/auth/logout', { method: 'POST' });
      
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
      navigate('/login');
    }
  };

  const handleCancelLogout = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Logging Out</h1>
          <p className="text-gray-600">You will be logged out in {countdown} seconds</p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          ></div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancelLogout}
            disabled={loading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={performLogout}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Logging out...
              </span>
            ) : (
              'Logout Now'
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This will clear your session and redirect you to the login page
          </p>
        </div>
      </div>
    </div>
  );
}

export default Logout; 