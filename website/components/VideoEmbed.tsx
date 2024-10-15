'use client';

import React from 'react';

const VideoEmbed = () => {
  return (
    <div className="w-full max-w-xl mx-auto mt-8 md:mt-12">
      <div className="relative w-full pt-[56.25%]">
        <iframe 
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
          src="https://www.youtube.com/embed/H8vkF5QLa_4"
          title="TrackJobs Demo"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default VideoEmbed;