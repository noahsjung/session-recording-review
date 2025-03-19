import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatTimestamp } from './utils';
import { TranscriptSelection } from './types';
import AudioRecorder from './AudioRecorder';

/**
 * FeedbackForm Props
 */
interface FeedbackFormProps {
  transcriptSelection: TranscriptSelection | null;
  isGeneralComment: boolean;
  onSubmit: (
    title: string,
    text: string,
    audioBlob?: Blob,
    isAudioFeedback?: boolean
  ) => void;
  onCancel: () => void;
}

/**
 * FeedbackForm Component
 * 
 * A form for providing feedback on counseling sessions.
 * Supports both text and audio feedback, and can be used for
 * general comments or specific transcript selections.
 * 
 * @param props - Component props
 * @returns React component
 */
const FeedbackForm: React.FC<FeedbackFormProps> = ({
  transcriptSelection,
  isGeneralComment,
  onSubmit,
  onCancel,
}) => {
  // Form state
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackMode, setFeedbackMode] = useState<'text' | 'audio'>('text');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  /**
   * Handle audio recording completion
   * 
   * @param blob - The recorded audio blob
   */
  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    // For text feedback
    if (feedbackMode === 'text') {
      onSubmit(
        feedbackTitle.trim() || 'Untitled Feedback',
        feedbackText,
        undefined,
        false
      );
    } 
    // For audio feedback
    else if (feedbackMode === 'audio' && audioBlob) {
      onSubmit(
        feedbackTitle.trim() || 'Audio Feedback',
        '',
        audioBlob,
        true
      );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-medium">
        {isGeneralComment 
          ? "Add General Comment" 
          : transcriptSelection 
            ? "Add Feedback for Selected Text" 
            : "Add Feedback"}
      </h3>

      {/* Feedback mode toggle */}
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={feedbackMode === "text"}
            onChange={() => setFeedbackMode("text")}
            className="h-4 w-4"
          />
          <span>Text Feedback</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={feedbackMode === "audio"}
            onChange={() => setFeedbackMode("audio")}
            className="h-4 w-4"
          />
          <span>Audio Feedback</span>
        </label>
      </div>

      {/* Selected text display (if applicable) */}
      {transcriptSelection && (
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-gray-600 mb-1">
            Selected text (
            {formatTimestamp(transcriptSelection.startTime)} -{" "}
            {formatTimestamp(transcriptSelection.endTime)}):
          </p>
          <p className="text-sm">"{transcriptSelection.text}"</p>
        </div>
      )}

      {/* Feedback title */}
      <div>
        <label
          htmlFor="feedback-title"
          className="block text-sm font-medium mb-1"
        >
          Feedback Title (Optional)
        </label>
        <Input
          id="feedback-title"
          value={feedbackTitle}
          onChange={(e) => setFeedbackTitle(e.target.value)}
          placeholder="Enter a title for your feedback"
        />
      </div>

      {/* Text feedback input (shown only in text mode) */}
      {feedbackMode === "text" && (
        <div>
          <label
            htmlFor="feedback-text"
            className="block text-sm font-medium mb-1"
          >
            Feedback
          </label>
          <Textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Enter your feedback here"
            rows={5}
          />
        </div>
      )}

      {/* Audio feedback input (shown only in audio mode) */}
      {feedbackMode === "audio" && (
        <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      )}

      {/* Action buttons */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            (feedbackMode === "text" && !feedbackText.trim()) ||
            (feedbackMode === "audio" && !audioBlob)
          }
        >
          Submit Feedback
        </Button>
      </div>
    </div>
  );
};

export default FeedbackForm; 