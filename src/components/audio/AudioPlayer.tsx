import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  feedbackMarkers?: { timestamp: number; id: string }[];
  onMarkerClick?: (id: string) => void;
  className?: string;
}

const AudioPlayer = ({
  src,
  feedbackMarkers = [],
  onMarkerClick,
  className,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);

  // Load audio data for visualization
  useEffect(() => {
    if (!src) return;

    // This is a placeholder for actual audio data visualization
    // In a real implementation, you would analyze the audio file
    // and extract frequency data for visualization
    const generatePlaceholderData = () => {
      const data = [];
      for (let i = 0; i < 100; i++) {
        data.push(Math.random() * 0.8 + 0.2); // Values between 0.2 and 1
      }
      setAudioData(data);
    };

    generatePlaceholderData();
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Method to seek to a specific timestamp (for external use)
  const seekToTimestamp = (timestamp: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = timestamp;
    setCurrentTime(timestamp);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, currentTime - 10);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.min(duration, currentTime + 10);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-md p-4", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Audio visualization */}
      <div className="relative h-24 mb-4 bg-gray-100 rounded-md overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-between p-1">
          {audioData.map((value, index) => {
            const isPlayed = currentTime / duration > index / audioData.length;
            return (
              <div
                key={index}
                className={`w-[0.5%] ${isPlayed ? "bg-blue-500" : "bg-gray-300"}`}
                style={{
                  height: `${value * 100}%`,
                  transition: "background-color 0.3s ease",
                }}
              />
            );
          })}
        </div>

        {/* Feedback markers */}
        {feedbackMarkers.map((marker) => {
          const position = (marker.timestamp / duration) * 100;
          return (
            <div
              key={marker.id}
              className="absolute top-0 w-1 h-full bg-red-500 cursor-pointer group"
              style={{ left: `${position}%` }}
              onClick={() => onMarkerClick?.(marker.id)}
              title={`Feedback at ${formatTime(marker.timestamp)}`}
            >
              <div className="absolute top-0 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-xs rounded px-1 py-0.5 whitespace-nowrap">
                {formatTime(marker.timestamp)}
              </div>
              <div className="absolute top-0 w-3 h-3 bg-red-600 rounded-full -ml-1 -mt-1"></div>
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
            size="icon"
            onClick={toggleMute}
            className="text-gray-700 hover:text-black"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={skipBackward}
            className="text-gray-700 hover:text-black flex items-center gap-1"
          >
            <SkipBack size={20} />
            <span className="text-xs">-10s</span>
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={togglePlayPause}
            className="bg-black text-white hover:bg-gray-800 rounded-full h-12 w-12 flex items-center justify-center"
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
            <span className="text-xs">+10s</span>
            <SkipForward size={20} />
          </Button>
        </div>
        <div className="w-[88px]" /> {/* Spacer to balance the layout */}
      </div>
    </div>
  );
};

export default AudioPlayer;
