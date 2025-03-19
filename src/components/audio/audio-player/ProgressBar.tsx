import React from 'react';
import { Slider } from '@/components/ui/slider';
import { ProgressBarProps } from './types';
import { formatTime, calculateMarkerPosition, calculateRangeWidth } from './utils';

/**
 * ProgressBar Component
 * 
 * Displays the audio playback progress and feedback markers.
 * Allows seeking to different positions in the audio.
 * 
 * @param props - Component props
 * @returns React component
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  markers,
  onSeek,
  onMarkerClick,
}) => {
  return (
    <>
      {/* Waveform visualization with markers */}
      <div className="relative h-12 bg-gray-100 rounded-md mb-2 overflow-hidden">
        {/* Render each feedback marker */}
        {markers.map((marker) => {
          const startPosition = calculateMarkerPosition(marker.timestamp, duration);
          const rangeWidth = marker.endTimestamp
            ? calculateRangeWidth(marker.timestamp, marker.endTimestamp, duration)
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
              {/* Tooltip shown on hover */}
              <div className="absolute top-0 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-xs rounded px-1 py-0.5 whitespace-nowrap z-10">
                {marker.endTimestamp
                  ? `${formatTime(marker.timestamp)} - ${formatTime(marker.endTimestamp)}`
                  : formatTime(marker.timestamp)}
              </div>
              
              {/* Start marker dot */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-red-600 rounded-full -ml-1 -mt-1"></div>
              
              {/* End marker dot (for range markers) */}
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

      {/* Seek slider */}
      <Slider
        value={[currentTime]}
        min={0}
        max={duration || 100} // Use 100 as a fallback if duration is not available
        step={0.1}
        onValueChange={onSeek}
        className="mb-4"
        aria-label="Seek"
      />

      {/* Time display */}
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </>
  );
};

export default ProgressBar; 