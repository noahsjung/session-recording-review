import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Clock, MessageSquare } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import FeedbackPanel from "./FeedbackPanel";
import { Session } from "./SessionList";

interface FeedbackItem {
  id: string;
  timestamp: number;
  text: string;
  audioResponse?: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: Date;
}

interface SessionDetailProps {
  session: Session;
  audioUrl: string;
  feedback: FeedbackItem[];
  onBack: () => void;
  onAddFeedback?: (text: string, timestamp: number) => void;
  onAddAudioResponse?: (audioBlob: Blob, feedbackId: string) => void;
  className?: string;
}

const SessionDetail = ({
  session,
  audioUrl,
  feedback,
  onBack,
  onAddFeedback,
  onAddAudioResponse,
  className,
}: SessionDetailProps) => {
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null,
  );

  // Scroll to the selected feedback when marker is clicked
  useEffect(() => {
    if (selectedFeedbackId) {
      const feedbackElement = document.getElementById(
        `feedback-${selectedFeedbackId}`,
      );
      if (feedbackElement) {
        feedbackElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedFeedbackId]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const getStatusColor = (status: Session["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Session["status"]) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Review Completed";
      default:
        return status;
    }
  };

  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const handleMarkerClick = (feedbackId: string) => {
    setSelectedFeedbackId(feedbackId);

    // Find the feedback item with this ID to get its timestamp
    const feedbackItem = feedback.find((item) => item.id === feedbackId);
    if (feedbackItem) {
      // Seek to the timestamp in the audio player
      const audioElement = document.querySelector("audio");
      if (audioElement) {
        audioElement.currentTime = feedbackItem.timestamp;
        audioElement.play();
      }
    }
  };

  // Create feedback markers for the audio player
  const feedbackMarkers = feedback.map((item) => ({
    timestamp: item.timestamp,
    id: item.id,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Sessions
        </Button>
        <Badge className={getStatusColor(session.status)}>
          {getStatusText(session.status)}
        </Badge>
      </div>

      <div className="sticky top-16 z-30 bg-white pb-4 shadow-md">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{session.title}</CardTitle>
                <CardDescription className="mt-2 flex flex-wrap items-center gap-4">
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Date: {formatDate(session.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    Duration: {formatDuration(session.duration)}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare size={14} className="mr-1" />
                    {feedback.length} comments
                  </span>
                  {session.sessionType && (
                    <span className="flex items-center">
                      Type: {session.sessionType}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-right">
                  <p className="font-medium">Supervisor Reviewed By</p>
                  <p>{session.supervisor.name}</p>
                </div>
                <Avatar>
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.supervisor.avatar}`}
                    alt={session.supervisor.name}
                  />
                  <AvatarFallback>{session.supervisor.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AudioPlayer
              src={audioUrl}
              feedbackMarkers={feedbackMarkers}
              onMarkerClick={handleMarkerClick}
            />
          </CardContent>
        </Card>
      </div>

      <FeedbackPanel
        sessionId={session.id}
        feedback={feedback}
        onAddFeedback={onAddFeedback}
        onAddAudioResponse={onAddAudioResponse}
        currentTimestamp={currentTimestamp}
        selectedFeedback={selectedFeedbackId}
      />
    </div>
  );
};

export default SessionDetail;
