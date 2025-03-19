import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  MessageSquare,
} from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

/**
 * Marker Interface
 * 
 * Represents a point or segment in the audio timeline where feedback has been added.
 * These markers will be displayed on the audio progress bar.
 */
interface Marker {
  id: string;               // Unique identifier for the marker
  timestamp: number;        // Position in seconds where the marker starts
  endTimestamp?: number;    // Optional end position for segment markers
}

/**
 * AudioPlayer Props
 * 
 * Properties that can be passed to the AudioPlayer component.
 */
interface AudioPlayerProps {
  src: string;              // URL of the audio file to play
  feedbackMarkers?: Marker[]; // Optional array of feedback markers to display
  onMarkerClick?: (markerId: string) => void;  // Called when a marker is clicked
  onTimeUpdate?: (time: number) => void;       // Called when playback position changes
  onAddFeedback?: () => void;                 // Called when user wants to add feedback
}

/**
 * Format Time Helper Function
 * 
 * Converts seconds into a human-readable format (MM:SS).
 * 
 * @param seconds - Time in seconds to format
 * @returns Formatted time string (e.g., "3:45")
 */
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * AudioPlayer Component
 * 
 * A customizable audio player that provides playback controls,
 * volume adjustment, and displays feedback markers on the timeline.
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  feedbackMarkers = [],
  onMarkerClick,
  onTimeUpdate,
  onAddFeedback,
}) => {
  // State for player functionality
  const [isPlaying, setIsPlaying] = useState(false);        // Whether audio is currently playing
  const [currentTime, setCurrentTime] = useState(0);        // Current playback position in seconds
  const [duration, setDuration] = useState(0);              // Total audio duration in seconds
  const [volume, setVolume] = useState(0.7);                // Volume level (0-1)
  const [isMuted, setIsMuted] = useState(false);            // Whether audio is muted
  const [showVolumeSlider, setShowVolumeSlider] = useState(false); // Whether to show volume controls

  // References to DOM elements and timers
  const audioRef = useRef<HTMLAudioElement>(null);          // Reference to the audio element
  const volumeControlRef = useRef<HTMLDivElement>(null);    // Reference to volume control UI
  const volumeSliderTimeoutRef = useRef<number | null>(null); // Timeout for hiding volume slider

  /**
   * Effect: Set up audio event listeners
   * 
   * Adds event listeners to the audio element to track playback state,
   * update UI, and notify parent components of changes.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Update current time and notify parent when playback position changes
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime);
      }
    };

    // Set total duration when metadata is loaded
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    // Update UI when playback ends
    const handleEnded = () => setIsPlaying(false);

    // Add event listeners
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    // Clean up event listeners when component unmounts
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate]);

  /**
   * Effect: Handle volume slider timeout
   * 
   * Automatically hides the volume slider after 2 seconds of inactivity.
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
   * Effect: Handle play/pause state
   * 
   * Plays or pauses the audio when isPlaying state changes.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Try to play and handle any errors (like autoplay restrictions)
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  /**
   * Effect: Handle volume changes
   * 
   * Updates audio volume when volume state or mute state changes.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set volume to 0 if muted, otherwise use volume state
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  /**
   * Toggle Play/Pause
   * 
   * Switches between playing and paused states.
   */
  const togglePlayPause = () => setIsPlaying(!isPlaying);

  /**
   * Handle Seek
   * 
   * Called when user drags the progress slider to change playback position.
   * 
   * @param values - Array containing the new playback position in seconds
   */
  const handleSeek = (values: number[]) => {
    const newTime = values[0];
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  /**
   * Handle Volume Change
   * 
   * Called when user adjusts the volume slider.
   * 
   * @param values - Array containing the new volume level (0-1)
   */
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    // Unmute if volume is increased from zero
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  /**
   * Toggle Mute
   * 
   * Toggles between muted and unmuted states.
   */
  const toggleMute = () => setIsMuted(!isMuted);

  /**
   * Skip Backward
   * 
   * Jumps back 10 seconds in the audio.
   */
  const skipBackward = () => {
    if (audioRef.current) {
      // Ensure we don't go below 0
      const newTime = Math.max(audioRef.current.currentTime - 10, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  /**
   * Skip Forward
   * 
   * Jumps ahead 10 seconds in the audio.
   */
  const skipForward = () => {
    if (audioRef.current) {
      // Ensure we don't go beyond the duration
      const newTime = Math.min(audioRef.current.currentTime + 10, duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Waveform visualization with markers */}
      <div className="relative h-12 bg-gray-100 rounded-md mb-2 overflow-hidden">
        {feedbackMarkers.map((marker) => {
          const startPosition = (marker.timestamp / duration) * 100;
          const rangeWidth = marker.endTimestamp
            ? ((marker.endTimestamp - marker.timestamp) / duration) * 100
            : 0;

          return (
            <div
              key={marker.id}
              className="absolute top-0 h-full cursor-pointer group"
              style={{
                left: `${startPosition}%`,
                width: marker.endTimestamp ? `${rangeWidth}%` : "2px",
                backgroundColor: marker.endTimestamp
                  ? "rgba(220, 38, 38, 0.3)"
                  : "rgb(220, 38, 38)",
              }}
              onClick={() => onMarkerClick?.(marker.id)}
              title={
                marker.endTimestamp
                  ? `Feedback from ${formatTime(marker.timestamp)} to ${formatTime(marker.endTimestamp)}`
                  : `Feedback at ${formatTime(marker.timestamp)}`
              }
            >
              <div className="absolute top-0 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-xs rounded px-1 py-0.5 whitespace-nowrap z-10">
                {marker.endTimestamp
                  ? `${formatTime(marker.timestamp)} - ${formatTime(marker.endTimestamp)}`
                  : formatTime(marker.timestamp)}
              </div>
              <div className="absolute top-0 left-0 w-3 h-3 bg-red-600 rounded-full -ml-1 -mt-1"></div>
              {marker.endTimestamp && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full -mr-1 -mt-1"></div>
              )}
            </div>
          );
        })}

        {/* Progress indicator */}
        <div
          className="absolute top-0 h-full bg-blue-200 opacity-30"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      {/* Time slider */}
      <Slider
        value={[currentTime]}
        min={0}
        max={duration || 100}
        step={0.1}
        onValueChange={handleSeek}
        className="mb-4"
      />

      {/* Time display */}
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={skipBackward}
            className="text-gray-700 hover:text-black flex items-center gap-1"
          >
            <SkipBack size={20} />
            <span className="text-xs hidden md:inline">-10s</span>
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={togglePlayPause}
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-full h-12 w-12 flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} className="ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={skipForward}
            className="text-gray-700 hover:text-black flex items-center gap-1"
          >
            <span className="text-xs hidden md:inline">+10s</span>
            <SkipForward size={20} />
          </Button>

          {/* Removed 'Add Feedback at Current Time' button */}
        </div>

        {/* Volume control - moved to the right */}
        <div
          className="relative md:block"
          ref={volumeControlRef}
          onMouseEnter={() => {
            setShowVolumeSlider(true);
            if (volumeSliderTimeoutRef.current) {
              window.clearTimeout(volumeSliderTimeoutRef.current);
              volumeSliderTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            if (volumeSliderTimeoutRef.current) {
              window.clearTimeout(volumeSliderTimeoutRef.current);
            }
            volumeSliderTimeoutRef.current = window.setTimeout(() => {
              setShowVolumeSlider(false);
            }, 2000);
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-gray-700 hover:text-black"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>

          {/* Volume slider - always visible on large screens, toggleable on small screens */}
          <div
            className={`absolute right-0 bottom-full mb-2 p-2 bg-white shadow-lg rounded-md z-10 transition-opacity duration-200 ${showVolumeSlider ? "opacity-100" : "opacity-0 pointer-events-none"} md:opacity-100 md:pointer-events-auto md:static md:shadow-none md:p-0 md:mb-0 md:ml-2 md:inline-flex md:items-center`}
          >
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24 md:w-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
