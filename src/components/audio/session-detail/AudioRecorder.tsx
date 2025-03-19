import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Play, Pause, X } from 'lucide-react';

/**
 * AudioRecorder Props
 */
interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

/**
 * AudioRecorder Component
 * 
 * Provides audio recording functionality for feedback.
 * Allows users to record, play back, and clear audio recordings.
 * 
 * @param props - Component props
 * @returns React component
 */
const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // References for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  /**
   * Start recording audio
   * 
   * Requests microphone access and begins recording audio.
   * Stores audio chunks in a ref for later processing.
   */
  const startRecording = async () => {
    try {
      // Request access to the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle new audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording completion
      mediaRecorder.onstop = () => {
        // Create a blob from the collected audio chunks
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(blob);
        onRecordingComplete(blob);
        
        // Create a temporary URL to the audio for playback
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
          console.log(`Recorded audio duration: ${audio.duration}s`);
        };
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  /**
   * Stop recording audio
   * 
   * Stops the MediaRecorder and processes the recording.
   */
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      // Stop recording
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
        
      // Update recording state
      setIsRecording(false);
    }
  };

  /**
   * Play recorded audio
   * 
   * Plays back the recorded audio blob.
   */
  const playAudio = () => {
    if (audioBlob) {
      // Create a temporary URL to the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Set up event handlers for playback state
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      
      // Start playback
      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        setIsPlaying(false);
      });
      
      setIsPlaying(true);
    }
  };

  /**
   * Clear the recorded audio
   */
  const clearAudio = () => {
    setAudioBlob(null);
  };

  return (
    <div className="bg-gray-50 p-3 rounded-md">
      <label className="block text-sm font-medium mb-2">
        Audio Recording
      </label>
      <div className="flex items-center gap-2">
        {!audioBlob ? (
          <Button
            variant={isRecording ? "destructive" : "outline"}
            onClick={isRecording ? stopRecording : startRecording}
            className="flex items-center gap-2"
          >
            <Mic
              size={16}
              className={isRecording ? "animate-pulse" : ""}
            />
            {isRecording ? "Stop Recording" : "Record Audio"}
          </Button>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={playAudio}
              disabled={isPlaying}
              className="flex items-center gap-1"
            >
              {isPlaying ? (
                <Pause size={14} />
              ) : (
                <Play size={14} />
              )}
              {isPlaying ? "Playing..." : "Play"}
            </Button>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex-1">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: isPlaying ? "100%" : "0%",
                  transition: "width 3s linear",
                }}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAudio}
              className="text-red-500 hover:text-red-700"
            >
              <X size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder; 