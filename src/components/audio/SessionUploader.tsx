import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, FileAudio, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Supervisor {
  id: string;
  name: string;
}

interface SessionUploaderProps {
  supervisors: Supervisor[];
  onUpload: (data: {
    audioFile: File;
    title: string;
    notes: string;
    supervisorId: string;
  }) => Promise<void>;
  className?: string;
}

const SessionUploader = ({
  supervisors,
  onUpload,
  className,
}: SessionUploaderProps) => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const location = useLocation();

  // Check if we have a supervisorId in the location state
  useEffect(() => {
    if (location.state && location.state.supervisorId) {
      setSupervisorId(location.state.supervisorId);
    }
  }, [location]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if file is an audio file
    if (!selectedFile.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Get audio duration
    const audio = new Audio();
    audio.src = URL.createObjectURL(selectedFile);
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    // Check if file is an audio file
    if (!droppedFile.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file.",
        variant: "destructive",
      });
      return;
    }

    setFile(droppedFile);

    // Get audio duration
    const audio = new Audio();
    audio.src = URL.createObjectURL(droppedFile);
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };
  };

  const handleRemoveFile = () => {
    setFile(null);
    setDuration(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !supervisorId) return;

    setIsUploading(true);
    try {
      await onUpload({
        audioFile: file,
        title,
        notes,
        supervisorId,
      });

      // Reset form
      setTitle("");
      setNotes("");
      setSupervisorId("");
      setFile(null);
      setDuration(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Session uploaded successfully",
        description: "Your supervisor will be notified of your request.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          "There was an error uploading your session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upload Session Recording</CardTitle>
        <CardDescription>
          Upload an audio recording of your counseling session to request
          feedback from a supervisor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              placeholder="E.g., Client A - Initial Assessment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supervisor">Select Supervisor</Label>
            <Select
              value={supervisorId}
              onValueChange={setSupervisorId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              placeholder="Provide context about the session and specific areas where you'd like feedback..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Audio Recording</Label>
            {!file ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium">
                  Drag and drop your audio file here
                </p>
                <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FileAudio className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock size={12} className="mr-1" />
                      {duration ? formatDuration(duration) : "Calculating..."}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={18} />
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={!file || !title || !supervisorId || isUploading}
          onClick={handleSubmit}
        >
          {isUploading ? "Uploading..." : "Request Feedback"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SessionUploader;
