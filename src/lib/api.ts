import { supabase } from "@/supabase/supabase";
import { Session } from "@/components/audio/SessionList";

// Supervisor types
export interface Supervisor {
  id: string;
  name: string;
  avatar: string;
  level: string;
  experience: string;
  background: string;
  introduction: string;
}

// Feedback types
export interface FeedbackItem {
  id: string;
  sessionId: string;
  timestamp: number;
  text: string;
  audioResponse?: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: Date;
}

// API functions for supervisors
export const getSupervisors = async (): Promise<Supervisor[]> => {
  const { data, error } = await supabase
    .from("supervisors")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching supervisors:", error);
    throw error;
  }

  return data.map((supervisor) => ({
    id: supervisor.id,
    name: supervisor.name,
    avatar: supervisor.avatar,
    level: supervisor.level,
    experience: supervisor.experience,
    background: supervisor.background,
    introduction: supervisor.introduction,
  }));
};

export const getSupervisorById = async (id: string): Promise<Supervisor> => {
  const { data, error } = await supabase
    .from("supervisors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching supervisor with ID ${id}:`, error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    avatar: data.avatar,
    level: data.level,
    experience: data.experience,
    background: data.background,
    introduction: data.introduction,
  };
};

// API functions for sessions
export const getSessions = async (): Promise<Session[]> => {
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("sessions")
    .select("*, supervisor:supervisor_id(id, name, avatar)")
    .order("created_at", { ascending: false });

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError);
    throw sessionsError;
  }

  // Get feedback counts for each session
  const sessionIds = sessionsData.map((session) => session.id);
  const { data: feedbackData, error: feedbackError } = await supabase
    .from("feedback")
    .select("session_id, count")
    .in("session_id", sessionIds)
    .group("session_id");

  if (feedbackError) {
    console.error("Error fetching feedback counts:", feedbackError);
    throw feedbackError;
  }

  // Create a map of session_id to feedback count
  const feedbackCounts = {};
  feedbackData.forEach((item) => {
    feedbackCounts[item.session_id] = parseInt(item.count);
  });

  return sessionsData.map((session) => ({
    id: session.id,
    title: session.title,
    createdAt: new Date(session.created_at),
    duration: session.duration || 0,
    feedbackCount: feedbackCounts[session.id] || 0,
    status: session.status,
    sessionType: session.session_type,
    supervisor: {
      id: session.supervisor?.id || "",
      name: session.supervisor?.name || "Unassigned",
      avatar: session.supervisor?.avatar || "",
    },
  }));
};

export const getSessionById = async (id: string): Promise<Session> => {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, supervisor:supervisor_id(id, name, avatar)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching session with ID ${id}:`, error);
    throw error;
  }

  // Get feedback count for this session
  const { count, error: countError } = await supabase
    .from("feedback")
    .select("id", { count: "exact" })
    .eq("session_id", id);

  if (countError) {
    console.error(
      `Error fetching feedback count for session ${id}:`,
      countError,
    );
    throw countError;
  }

  return {
    id: data.id,
    title: data.title,
    createdAt: new Date(data.created_at),
    duration: data.duration || 0,
    feedbackCount: count || 0,
    status: data.status,
    sessionType: data.session_type,
    supervisor: {
      id: data.supervisor?.id || "",
      name: data.supervisor?.name || "Unassigned",
      avatar: data.supervisor?.avatar || "",
    },
  };
};

export const createSession = async (sessionData: {
  title: string;
  supervisorId: string;
  audioFile: File;
  notes: string;
  sessionType?: string;
}): Promise<Session> => {
  // First, upload the audio file to storage
  const fileName = `${Date.now()}-${sessionData.audioFile.name}`;
  const filePath = `sessions/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("audio")
    .upload(filePath, sessionData.audioFile);

  if (uploadError) {
    console.error("Error uploading audio file:", uploadError);
    throw uploadError;
  }

  // Get the public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from("audio")
    .getPublicUrl(filePath);
  const audioUrl = urlData.publicUrl;

  // Create a new session record
  const { data: user } = await supabase.auth.getUser();
  if (!user || !user.user) {
    throw new Error("User not authenticated");
  }

  // Get audio duration
  const audio = new Audio();
  audio.src = URL.createObjectURL(sessionData.audioFile);
  await new Promise((resolve) => {
    audio.onloadedmetadata = resolve;
  });
  const duration = Math.round(audio.duration);

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      title: sessionData.title,
      user_id: user.user.id,
      supervisor_id: sessionData.supervisorId,
      audio_url: audioUrl,
      duration: duration,
      notes: sessionData.notes,
      session_type: sessionData.sessionType || "General",
      status: "pending",
    })
    .select("*, supervisor:supervisor_id(id, name, avatar)")
    .single();

  if (error) {
    console.error("Error creating session:", error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    createdAt: new Date(data.created_at),
    duration: data.duration || 0,
    feedbackCount: 0,
    status: data.status,
    sessionType: data.session_type,
    supervisor: {
      id: data.supervisor?.id || "",
      name: data.supervisor?.name || "Unassigned",
      avatar: data.supervisor?.avatar || "",
    },
  };
};

// API functions for feedback
export const getFeedbackForSession = async (
  sessionId: string,
): Promise<FeedbackItem[]> => {
  const { data: feedbackData, error: feedbackError } = await supabase
    .from("feedback")
    .select("*, author:author_id(id, email, user_metadata)")
    .eq("session_id", sessionId)
    .order("timestamp");

  if (feedbackError) {
    console.error(
      `Error fetching feedback for session ${sessionId}:`,
      feedbackError,
    );
    throw feedbackError;
  }

  return feedbackData.map((feedback) => ({
    id: feedback.id,
    sessionId: feedback.session_id,
    timestamp: feedback.timestamp,
    text: feedback.text,
    audioResponse: feedback.audio_response,
    author: {
      name:
        feedback.author?.user_metadata?.full_name ||
        feedback.author?.email ||
        "Unknown",
      avatar: feedback.author?.email?.split("@")[0] || "user",
    },
    createdAt: new Date(feedback.created_at),
  }));
};

export const addFeedback = async (
  sessionId: string,
  text: string,
  timestamp: number,
): Promise<FeedbackItem> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user || !user.user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      session_id: sessionId,
      author_id: user.user.id,
      timestamp: timestamp,
      text: text,
    })
    .select("*, author:author_id(id, email, user_metadata)")
    .single();

  if (error) {
    console.error("Error adding feedback:", error);
    throw error;
  }

  // Update session status to in_progress if it was pending
  const { error: updateError } = await supabase
    .from("sessions")
    .update({ status: "in_progress" })
    .eq("id", sessionId)
    .eq("status", "pending");

  if (updateError) {
    console.error("Error updating session status:", updateError);
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    timestamp: data.timestamp,
    text: data.text,
    audioResponse: data.audio_response,
    author: {
      name:
        data.author?.user_metadata?.full_name ||
        data.author?.email ||
        "Unknown",
      avatar: data.author?.email?.split("@")[0] || "user",
    },
    createdAt: new Date(data.created_at),
  };
};

export const addAudioResponse = async (
  feedbackId: string,
  audioBlob: Blob,
): Promise<string> => {
  // First, upload the audio file to storage
  const fileName = `${Date.now()}-response.webm`;
  const filePath = `feedback/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("audio")
    .upload(filePath, audioBlob);

  if (uploadError) {
    console.error("Error uploading audio response:", uploadError);
    throw uploadError;
  }

  // Get the public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from("audio")
    .getPublicUrl(filePath);
  const audioUrl = urlData.publicUrl;

  // Update the feedback record with the audio response URL
  const { error } = await supabase
    .from("feedback")
    .update({ audio_response: audioUrl })
    .eq("id", feedbackId);

  if (error) {
    console.error("Error updating feedback with audio response:", error);
    throw error;
  }

  return audioUrl;
};
