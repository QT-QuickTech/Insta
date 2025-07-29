import React from 'react';

import StoryBar from './StoryBar';
import HomePostFeed from './HomePostFeed';
import RightSidebar from './RightSidebar';

function Home() {

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <main className="flex-1 flex flex-col items-center mx-auto max-w-[44rem] w-full px-4 md:px-0">
        {/* Stories Bar */}
        <StoryBar />
        {/* Posts Feed */}
        <HomePostFeed  />
      </main>
      {/* Right Sidebar */}
      <RightSidebar  />
      
    </div>
  );
}

export default Home;