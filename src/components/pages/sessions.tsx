import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import SessionUploader from "../audio/SessionUploader";
import SessionList, { Session } from "../audio/SessionList";
import SessionDetail from "../audio/SessionDetail";

// Mock data for supervisors
const supervisors = [
  { id: "1", name: "Dr. Sarah Johnson" },
  { id: "2", name: "Dr. Michael Chen" },
  { id: "3", name: "Dr. Aisha Patel" },
];

// Mock data for sessions
const mockSessions: Session[] = [
  {
    id: "1",
    title: "Client A - Initial Assessment",
    createdAt: new Date("2023-06-15"),
    duration: 2580, // 43 minutes
    feedbackCount: 5,
    status: "completed",
    supervisor: {
      id: "1",
      name: "Dr. Sarah Johnson",
      avatar: "sarah",
    },
    sessionType: "Initial Assessment",
  },
  {
    id: "2",
    title: "Client B - Cognitive Behavioral Therapy Session",
    createdAt: new Date("2023-06-22"),
    duration: 3120, // 52 minutes
    feedbackCount: 3,
    status: "in_progress",
    supervisor: {
      id: "2",
      name: "Dr. Michael Chen",
      avatar: "michael",
    },
    sessionType: "Cognitive Behavioral Therapy",
  },
  {
    id: "3",
    title: "Client C - Follow-up Session",
    createdAt: new Date("2023-06-29"),
    duration: 1920, // 32 minutes
    feedbackCount: 0,
    status: "pending",
    supervisor: {
      id: "3",
      name: "Dr. Aisha Patel",
      avatar: "aisha",
    },
    sessionType: "Follow-up",
  },
];

// Mock feedback data
const mockFeedback = [
  {
    id: "f1",
    sessionId: "1",
    timestamp: 120, // 2 minutes
    text: "Great introduction and rapport building. You established trust quickly with the client.",
    author: {
      name: "Dr. Sarah Johnson",
      avatar: "sarah",
    },
    createdAt: new Date("2023-06-16"),
  },
  {
    id: "f2",
    sessionId: "1",
    timestamp: 450, // 7:30 minutes
    text: "Consider using more open-ended questions here to encourage the client to elaborate.",
    audioResponse: "audio-response-1.mp3",
    author: {
      name: "Dr. Sarah Johnson",
      avatar: "sarah",
    },
    createdAt: new Date("2023-06-16"),
  },
  {
    id: "f3",
    sessionId: "1",
    timestamp: 890, // 14:50 minutes
    text: "Good use of reflection. The client seemed to respond well to this technique.",
    author: {
      name: "Dr. Sarah Johnson",
      avatar: "sarah",
    },
    createdAt: new Date("2023-06-16"),
  },
  {
    id: "f4",
    sessionId: "1",
    timestamp: 1500, // 25 minutes
    text: "This would be a good opportunity to introduce the concept of cognitive restructuring.",
    audioResponse: "audio-response-2.mp3",
    author: {
      name: "Dr. Sarah Johnson",
      avatar: "sarah",
    },
    createdAt: new Date("2023-06-16"),
  },
  {
    id: "f5",
    sessionId: "1",
    timestamp: 2100, // 35 minutes
    text: "Excellent summary and goal-setting for the next session. Clear and collaborative.",
    author: {
      name: "Dr. Sarah Johnson",
      avatar: "sarah",
    },
    createdAt: new Date("2023-06-16"),
  },
  {
    id: "f6",
    sessionId: "2",
    timestamp: 300, // 5 minutes
    text: "Good check-in about homework from the previous session.",
    author: {
      name: "Dr. Michael Chen",
      avatar: "michael",
    },
    createdAt: new Date("2023-06-23"),
  },
  {
    id: "f7",
    sessionId: "2",
    timestamp: 1200, // 20 minutes
    text: "Consider exploring the underlying beliefs more here. There seems to be a core belief about perfectionism.",
    audioResponse: "audio-response-3.mp3",
    author: {
      name: "Dr. Michael Chen",
      avatar: "michael",
    },
    createdAt: new Date("2023-06-23"),
  },
  {
    id: "f8",
    sessionId: "2",
    timestamp: 2400, // 40 minutes
    text: "The thought record exercise was well-executed. Good job guiding the client through it step by step.",
    author: {
      name: "Dr. Michael Chen",
      avatar: "michael",
    },
    createdAt: new Date("2023-06-23"),
  },
];

const SessionsPage = () => {
  const [activeTab, setActiveTab] = useState("view");
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if we should show upload mode from location state
  useEffect(() => {
    if (location.state && location.state.uploadMode) {
      setActiveTab("upload");
    }
  }, [location]);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const { toast } = useToast();

  // Check if we have a sessionId in the location state
  useEffect(() => {
    if (location.state && location.state.sessionId) {
      setSelectedSessionId(location.state.sessionId);
    }
  }, [location]);

  const selectedSession = selectedSessionId
    ? sessions.find((session) => session.id === selectedSessionId) || null
    : null;

  const sessionFeedback = selectedSessionId
    ? mockFeedback.filter(
        (feedback) => feedback.sessionId === selectedSessionId,
      )
    : [];

  const handleUpload = async (data: {
    audioFile: File;
    title: string;
    notes: string;
    supervisorId: string;
  }) => {
    // In a real implementation, you would upload the file to a storage service
    // and create a new session in the database

    // Simulate a delay for the upload
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a new session
    const newSession: Session = {
      id: `${sessions.length + 1}`,
      title: data.title,
      createdAt: new Date(),
      duration: Math.floor(Math.random() * 3000) + 1200, // Random duration between 20-70 minutes
      feedbackCount: 0,
      status: "pending",
      supervisor: {
        id: data.supervisorId,
        name:
          supervisors.find((supervisor) => supervisor.id === data.supervisorId)
            ?.name || "Unknown Supervisor",
        avatar:
          data.supervisorId === "1"
            ? "sarah"
            : data.supervisorId === "2"
              ? "michael"
              : "aisha",
      },
    };

    setSessions([newSession, ...sessions]);
    setActiveTab("view");
  };

  const handleAddFeedback = (text: string, timestamp: number) => {
    if (!selectedSessionId) return;

    // In a real implementation, you would save the feedback to the database
    const newFeedback = {
      id: `f${mockFeedback.length + 1}`,
      sessionId: selectedSessionId,
      timestamp,
      text,
      author: {
        name: "Dr. Sarah Johnson", // This would be the current user in a real app
        avatar: "sarah",
      },
      createdAt: new Date(),
    };

    // Update the session's feedback count
    setSessions(
      sessions.map((session) =>
        session.id === selectedSessionId
          ? { ...session, feedbackCount: session.feedbackCount + 1 }
          : session,
      ),
    );

    toast({
      title: "Feedback added",
      description: "Your feedback has been added to the session.",
      variant: "default",
    });
  };

  const handleAddAudioResponse = (audioBlob: Blob, feedbackId: string) => {
    // In a real implementation, you would upload the audio blob to a storage service
    // and update the feedback item with the audio URL

    toast({
      title: "Audio response added",
      description: "Your audio response has been added to the feedback.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNavigation
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex flex-col md:flex-row pt-16">
        <div
          className={isCollapsed ? "w-[70px]" : "w-[240px]"}
          aria-hidden="true"
        ></div>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <main className="flex-1 overflow-auto p-6 transition-all duration-300">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Session Feedback
            </h1>
            <p className="text-gray-600">
              Upload session recordings and receive feedback from your
              supervisors.
            </p>
          </div>

          {selectedSession ? (
            <SessionDetail
              session={selectedSession}
              audioUrl="https://example.com/audio-sample.mp3" // This would be the actual audio URL in a real app
              feedback={sessionFeedback}
              onBack={() => setSelectedSessionId(null)}
              onAddFeedback={handleAddFeedback}
              onAddAudioResponse={handleAddAudioResponse}
            />
          ) : (
            <div className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Sessions</h2>
                <Button onClick={() => setActiveTab("upload")}>
                  <Plus size={16} className="mr-2" /> New Session
                </Button>
              </div>

              {activeTab === "view" ? (
                <SessionList
                  sessions={sessions}
                  onSelectSession={setSelectedSessionId}
                  selectedSessionId={selectedSessionId || undefined}
                />
              ) : (
                <SessionUploader
                  supervisors={supervisors}
                  onUpload={(data) => {
                    handleUpload(data);
                    setActiveTab("view");
                  }}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SessionsPage;
