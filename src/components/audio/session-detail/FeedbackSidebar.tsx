import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import FeedbackPanel from '../FeedbackPanel';
import FeedbackForm from './FeedbackForm';
import { FeedbackItem, TranscriptSelection } from './types';

/**
 * FeedbackSidebar Props
 */
interface FeedbackSidebarProps {
  sessionId: string;
  feedback: FeedbackItem[];
  currentTimestamp: number;
  selectedFeedbackId: string | null;
  sessionStatus: string;
  onAddFeedback: (
    title: string,
    text: string,
    timestamp: number,
    endTimestamp?: number,
    audioBlob?: Blob,
    isGeneral?: boolean
  ) => void;
  onAddAudioResponse: (
    audioBlob: Blob,
    feedbackId: string
  ) => void;
}

/**
 * FeedbackSidebar Component
 * 
 * Displays the right sidebar containing feedback functionality.
 * Can be minimized/expanded and shows different views for adding/viewing feedback.
 * 
 * @param props - Component props
 * @returns React component
 */
const FeedbackSidebar: React.FC<FeedbackSidebarProps> = ({
  sessionId,
  feedback,
  currentTimestamp,
  selectedFeedbackId,
  sessionStatus,
  onAddFeedback,
  onAddAudioResponse
}) => {
  // State
  const [isMinimized, setIsMinimized] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showGeneralCommentForm, setShowGeneralCommentForm] = useState(false);
  const [transcriptSelection, setTranscriptSelection] = useState<TranscriptSelection | null>(null);

  /**
   * Handle feedback submission
   * 
   * @param title - Feedback title
   * @param text - Feedback text content
   * @param audioBlob - Optional audio recording
   * @param isAudioFeedback - Whether this is audio feedback
   */
  const handleFeedbackSubmit = (
    title: string,
    text: string,
    audioBlob?: Blob,
    isAudioFeedback?: boolean
  ) => {
    if (showGeneralCommentForm) {
      // Submit general comment
      onAddFeedback(
        title,
        text,
        0, // General comments use timestamp 0
        undefined,
        audioBlob,
        true
      );
    } else if (transcriptSelection) {
      // Submit feedback for selected transcript segment
      onAddFeedback(
        title,
        text,
        transcriptSelection.startTime,
        transcriptSelection.endTime,
        audioBlob,
        false
      );
    }

    // Reset form state
    setShowFeedbackForm(false);
    setShowGeneralCommentForm(false);
    setTranscriptSelection(null);
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    setShowFeedbackForm(false);
    setShowGeneralCommentForm(false);
    setTranscriptSelection(null);
  };

  /**
   * Set transcript selection and show feedback form
   * 
   * @param selection - The selected transcript segment
   */
  const setSelectionAndShowForm = (selection: TranscriptSelection | null) => {
    setTranscriptSelection(selection);
    setShowFeedbackForm(!!selection);
  };

  // If the sidebar is minimized, only show the expand button
  if (isMinimized) {
    return (
      <Button
        variant="ghost"
        className="w-full h-12 flex justify-center items-center"
        onClick={() => setIsMinimized(false)}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium">Session Feedback</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGeneralCommentForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add General Comment
          </Button>
          {sessionStatus !== "completed" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                // In a real app, this would call an API to update the session status
                alert("Review completed! Notification sent to counselor.");
              }}
            >
              Complete Review
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {showFeedbackForm || showGeneralCommentForm ? (
          <FeedbackForm
            transcriptSelection={transcriptSelection}
            isGeneralComment={showGeneralCommentForm}
            onSubmit={handleFeedbackSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <FeedbackPanel
            sessionId={sessionId}
            feedback={feedback}
            onAddFeedback={onAddFeedback}
            onAddAudioResponse={onAddAudioResponse}
            currentTimestamp={currentTimestamp}
            selectedFeedback={selectedFeedbackId}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
};

export default FeedbackSidebar; 