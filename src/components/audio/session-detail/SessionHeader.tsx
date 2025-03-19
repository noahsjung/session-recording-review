import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Session } from "../SessionList";
import { formatDate, formatDuration, getStatusColor, getStatusText } from "./utils";

/**
 * SessionHeader Component Props
 */
interface SessionHeaderProps {
  session: Session;
  duration: number;
  onBack: () => void;
}

/**
 * SessionHeader Component
 * 
 * Displays the header section of the session detail page, including:
 * - Back button
 * - Session title
 * - Session date and duration
 * - Session status badge
 * 
 * @param props - Component props
 * @returns React component
 */
const SessionHeader: React.FC<SessionHeaderProps> = ({ session, duration, onBack }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{session.title}</h2>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="mr-3">{formatDate(session.createdAt)}</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>
      <Badge className={getStatusColor(session.status)}>
        {getStatusText(session.status)}
      </Badge>
    </div>
  );
};

export default SessionHeader; 