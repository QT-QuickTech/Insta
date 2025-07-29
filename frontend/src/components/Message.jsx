import React from 'react';

function Message() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full h-full">
      <div className="bg-gray-50 rounded-lg p-20 px-40 ">
        <div className="text-gray-400 mb-4">
          <i className="bi bi-chat-quote text-6xl"></i>
        </div>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Messages</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          This feature is coming soon! 
        </p>
        <div className="mt-4 text-xs text-gray-400">
          Future Update
        </div>
      </div>
    </div>
  );
}

export default Message; 