import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaybackControlsProps } from './types';

/**
 * PlaybackControls Component
 * 
 * Provides play/pause and skip controls for the audio player.
 * 
 * @param props - Component props
 * @returns React component
 */
const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayPause,
  onSkipBackward,
  onSkipForward,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        onClick={onSkipBackward}
        className="text-gray-700 hover:text-black flex items-center gap-1"
        aria-label="Skip backward 10 seconds"
      >
        <SkipBack size={20} />
        <span className="text-xs hidden md:inline">-10s</span>
      </Button>

      <Button
        variant="default"
        size="icon"
        onClick={onPlayPause}
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-full h-12 w-12 flex items-center justify-center"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause size={24} />
        ) : (
          <Play size={24} className="ml-1" />
        )}
      </Button>

      <Button
        variant="ghost"
        onClick={onSkipForward}
        className="text-gray-700 hover:text-black flex items-center gap-1"
        aria-label="Skip forward 10 seconds"
      >
        <span className="text-xs hidden md:inline">+10s</span>
        <SkipForward size={20} />
      </Button>
    </div>
  );
};

export default PlaybackControls; 