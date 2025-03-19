import React from 'react';
import MiniPlayer from '../../MiniPlayer';
import { MiniPlayerContainerProps } from '../types';

/**
 * MiniPlayerContainer Component
 * 
 * A wrapper component for the mini player.
 * The mini player is displayed when the full player is not visible.
 * 
 * @param props - Component props
 * @returns React component
 */
const MiniPlayerContainer: React.FC<MiniPlayerContainerProps> = ({
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  onSkipBackward,
  onSkipForward,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
      <MiniPlayer
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onSeek={onSeek}
        onSkipBackward={onSkipBackward}
        onSkipForward={onSkipForward}
      />
    </div>
  );
};

export default MiniPlayerContainer; 