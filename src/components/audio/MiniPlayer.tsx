import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MiniPlayerProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (value: number[]) => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  className?: string;
}

const MiniPlayer = ({
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  onSkipBackward,
  onSkipForward,
  className,
}: MiniPlayerProps) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-50 flex items-center space-x-2 shadow-lg w-[calc(100%-var(--sidebar-width,0px))]",
        className,
      )}
      style={{ marginLeft: "var(--sidebar-width, 0px)" }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onSkipBackward}
        className="text-gray-700 hover:text-black"
      >
        <SkipBack size={16} />
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={onPlayPause}
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-full h-8 w-8 flex items-center justify-center p-0"
      >
        {isPlaying ? (
          <Pause size={16} />
        ) : (
          <Play size={16} className="ml-0.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onSkipForward}
        className="text-gray-700 hover:text-black"
      >
        <SkipForward size={16} />
      </Button>

      <div className="flex-1 flex items-center space-x-2">
        <span className="text-xs text-gray-700">{formatTime(currentTime)}</span>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={onSeek}
          className="flex-1"
        />
        <span className="text-xs text-gray-700">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default MiniPlayer;
