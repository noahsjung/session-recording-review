import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { VolumeControlsProps } from './types';

/**
 * VolumeControls Component
 * 
 * Provides volume control and mute functionality for the audio player.
 * Supports both desktop and mobile layouts.
 * 
 * @param props - Component props
 * @returns React component
 */
const VolumeControls: React.FC<VolumeControlsProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}) => {
  // Whether to show the volume slider on mobile
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  // References
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const volumeSliderTimeoutRef = useRef<number | null>(null);

  /**
   * Effect: Handle volume slider timeout
   * 
   * Automatically hides the volume slider after 2 seconds of inactivity on mobile.
   */
  useEffect(() => {
    const handleMouseMove = () => {
      // Clear any existing timeout
      if (volumeSliderTimeoutRef.current) {
        window.clearTimeout(volumeSliderTimeoutRef.current);
      }
      
      // Set a new timeout if the volume slider is visible
      if (showVolumeSlider) {
        volumeSliderTimeoutRef.current = window.setTimeout(() => {
          setShowVolumeSlider(false);
        }, 2000);
      }
    };

    // Add event listener for mouse movement
    window.addEventListener("mousemove", handleMouseMove);
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (volumeSliderTimeoutRef.current) {
        window.clearTimeout(volumeSliderTimeoutRef.current);
      }
    };
  }, [showVolumeSlider]);

  /**
   * Handle mouse enter on volume control
   */
  const handleMouseEnter = () => {
    setShowVolumeSlider(true);
    if (volumeSliderTimeoutRef.current) {
      window.clearTimeout(volumeSliderTimeoutRef.current);
      volumeSliderTimeoutRef.current = null;
    }
  };

  /**
   * Handle mouse leave on volume control
   */
  const handleMouseLeave = () => {
    if (volumeSliderTimeoutRef.current) {
      window.clearTimeout(volumeSliderTimeoutRef.current);
    }
    volumeSliderTimeoutRef.current = window.setTimeout(() => {
      setShowVolumeSlider(false);
    }, 2000);
  };

  return (
    <div
      className="relative md:block"
      ref={volumeControlRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
        className="text-gray-700 hover:text-black"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </Button>

      {/* Volume slider - always visible on large screens, toggleable on small screens */}
      <div
        className={`absolute right-0 bottom-full mb-2 p-2 bg-white shadow-lg rounded-md z-10 transition-opacity duration-200 ${
          showVolumeSlider ? "opacity-100" : "opacity-0 pointer-events-none"
        } md:opacity-100 md:pointer-events-auto md:static md:shadow-none md:p-0 md:mb-0 md:ml-2 md:inline-flex md:items-center`}
      >
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={onVolumeChange}
          className="w-24 md:w-32"
          aria-label="Volume"
        />
      </div>
    </div>
  );
};

export default VolumeControls; 