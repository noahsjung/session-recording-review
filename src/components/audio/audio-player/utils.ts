/**
 * Format Time Helper Function
 * 
 * Converts seconds into a human-readable format (MM:SS).
 * 
 * @param seconds - Time in seconds to format
 * @returns Formatted time string (e.g., "3:45")
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Calculate Marker Position
 * 
 * Calculates the position of a marker as a percentage of the total duration.
 * 
 * @param timestamp - Marker timestamp in seconds
 * @param duration - Total audio duration in seconds
 * @returns Position as a percentage (0-100)
 */
export const calculateMarkerPosition = (timestamp: number, duration: number): number => {
  if (duration <= 0) return 0;
  return (timestamp / duration) * 100;
};

/**
 * Calculate Range Width
 * 
 * Calculates the width of a range marker as a percentage of the total duration.
 * 
 * @param startTimestamp - Start timestamp in seconds
 * @param endTimestamp - End timestamp in seconds
 * @param duration - Total audio duration in seconds
 * @returns Width as a percentage (0-100)
 */
export const calculateRangeWidth = (
  startTimestamp: number,
  endTimestamp: number,
  duration: number
): number => {
  if (duration <= 0) return 0;
  return ((endTimestamp - startTimestamp) / duration) * 100;
};

/**
 * Clamp Value
 * 
 * Ensures a value is within a specified range.
 * 
 * @param value - The value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
}; 