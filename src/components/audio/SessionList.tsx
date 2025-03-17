import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileAudio,
  Clock,
  MessageSquare,
  User,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Session {
  id: string;
  title: string;
  createdAt: Date;
  duration: number;
  feedbackCount: number;
  status: "pending" | "in_progress" | "completed";
  supervisor: {
    id: string;
    name: string;
    avatar: string;
  };
  sessionType?: string;
}

interface SessionListProps {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
  selectedSessionId?: string;
  className?: string;
}

const SessionList = ({
  sessions,
  onSelectSession,
  selectedSessionId,
  className,
}: SessionListProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
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
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Your Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileAudio className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No sessions uploaded yet.</p>
              <p className="text-sm mt-1">Upload a session to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedSessionId === session.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium truncate">{session.title}</h3>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusText(session.status)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center text-sm text-gray-500 mb-3 gap-3">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDuration(session.duration)}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare size={14} className="mr-1" />
                      {session.feedbackCount} comments
                    </div>
                    <div>Date: {formatDate(session.createdAt)}</div>
                    {session.sessionType && (
                      <div>Type: {session.sessionType}</div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.supervisor.avatar}`}
                          alt={session.supervisor.name}
                        />
                        <AvatarFallback>
                          {session.supervisor.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center text-sm">
                        <User size={12} className="mr-1 text-gray-400" />
                        <span>{session.supervisor.name}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSession(session.id);
                      }}
                    >
                      View <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SessionList;
