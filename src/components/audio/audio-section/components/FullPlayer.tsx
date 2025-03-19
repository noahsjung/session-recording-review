import React from 'react';
import AudioPlayer from '../../AudioPlayer';
import { FullPlayerProps } from '../types';

/**
 * FullPlayer Component
 * 
 * A wrapper component for the full-sized audio player.
 * This component is observed by IntersectionObserver to determine when it's in view.
 * 
 * @param props - Component props
 * @returns React component
 */
const FullPlayer: React.FC<FullPlayerProps> = ({
  audioUrl,
  feedbackMarkers,
  onMarkerClick,
  onTimeUpdate,
  playerRef,
}) => {
  return (
    <div ref={playerRef} className="p-4">
      <AudioPlayer
        src={audioUrl}
        feedbackMarkers={feedbackMarkers}
        onMarkerClick={onMarkerClick}
        onTimeUpdate={onTimeUpdate}
      />
    </div>
  );
};

export default FullPlayer; 