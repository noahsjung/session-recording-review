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

interface Marker {
  id: string;
  timestamp: number;
  endTimestamp?: number;
}

interface AudioPlayerProps {
  src: string;
  feedbackMarkers?: Marker[];
  onMarkerClick?: (markerId: string) => void;
  onTimeUpdate?: (time: number) => void;
  onAddFeedback?: () => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  feedbackMarkers = [],
  onMarkerClick,
  onTimeUpdate,
  onAddFeedback,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlayPause = () => setIsPlaying(!isPlaying);

  const handleSeek = (values: number[]) => {
    const newTime = values[0];
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const skipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 10, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + 10, duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
      <audio ref={audioRef} src={src} preload="metadata" />

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

          {onAddFeedback && (
            <Button
              variant="outline"
              onClick={onAddFeedback}
              className="ml-2 text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <MessageSquare size={16} className="mr-2" />
              Add Feedback at Current Time
            </Button>
          )}
        </div>

        {/* Volume control - moved to the right */}
        <div
          className="relative md:block"
          ref={volumeControlRef}
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
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
