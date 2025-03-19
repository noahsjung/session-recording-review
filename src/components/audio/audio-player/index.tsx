import React, { useState, useRef, useEffect } from "react";
import { AudioPlayerProps } from "./types";
import { clamp } from "./utils";
import PlaybackControls from "./PlaybackControls";
import VolumeControls from "./VolumeControls";
import ProgressBar from "./ProgressBar";

/**
 * AudioPlayer Component
 * 
 * A comprehensive audio player component that provides playback controls,
 * volume adjustment, and displays feedback markers on the timeline.
 * 
 * @param props - Component props
 * @returns React component
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  feedbackMarkers = [],
  onMarkerClick,
  onTimeUpdate,
  onAddFeedback,
}) => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Volume state
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement>(null);

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
      const newTime = clamp(audioRef.current.currentTime - 10, 0, duration);
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
      const newTime = clamp(audioRef.current.currentTime + 10, 0, duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Progress bar and markers */}
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        markers={feedbackMarkers}
        onSeek={handleSeek}
        onMarkerClick={onMarkerClick}
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left side - Playback controls */}
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onSkipBackward={skipBackward}
          onSkipForward={skipForward}
        />

        {/* Right side - Volume control */}
        <VolumeControls
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
        />
      </div>
    </div>
  );
};

export default AudioPlayer; 