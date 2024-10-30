import type React from 'react';
import { useState } from 'react';
import { Youtube } from 'lucide-react';
import Image from 'next/image';

const VideoEmbed: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const videoId = 'H8vkF5QLa_4';
  
  const thumbnailUrl = thumbnailError 
    ? '/trackjobs_og.png'
    : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative w-full md:w-1/2 aspect-video rounded-lg overflow-hidden">
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
              priority
            />
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/20 
                group-hover:bg-black/30 transition-all duration-200 rounded-lg"
            >
              <Youtube 
                className="w-16 h-16 text-[#ff0000] opacity-90               
                  group-hover:opacity-100 group-hover:scale-105 
                  transition-all duration-200" 
              />
            </div>
          </div>
        </button>
      ) : (
        <iframe
          className="absolute inset-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="TrackJobs Demo Video"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default VideoEmbed;