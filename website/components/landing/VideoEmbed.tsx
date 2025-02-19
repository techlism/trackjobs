import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';

const VideoEmbed: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const videoId = 'H8vkF5QLa_4';
  
  const thumbnailUrl = thumbnailError 
    ? '/trackjobs_og.png'
    : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative w-full  aspect-video rounded-lg overflow-hidden">
      {!isLoaded ? (
        <button 
          type="button"
          onClick={() => setIsLoaded(true)}
          className="absolute inset-0 w-full h-full p-0 m-0 border-0 rounded-lg overflow-hidden group"
          aria-label="Play video demonstration"
        >
          <div className="relative w-full h-full">
            <Image
              src={thumbnailUrl}
              alt="Video demonstration preview"          
              fill
              className="object-cover rounded-lg"
              onError={() => setThumbnailError(true)}
              loading='lazy'
            />
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all duration-200 rounded-lg"
            >
              <Image
                src="/youtube_logo.svg"
                alt="Play button"
                height={50}
                width={50}
                priority              
              />
            </div>
          </div>
        </button>
      ) : (
        <iframe
          className="absolute inset-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="TrackJobs Demo Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default VideoEmbed;