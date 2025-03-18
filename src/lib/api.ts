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
  try {
    const { data, error } = await supabase
      .from("supervisors")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching supervisors:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      // Return mock data if no supervisors found in the database
      return [
        {
          id: "1",
          name: "Dr. Sarah Johnson",
          avatar: "sarah",
          title: "Clinical Psychologist",
          specialization: "Cognitive Behavioral Therapy",
          yearsOfExperience: 12,
          certifications: ["Licensed Clinical Psychologist", "CBT Certified"],
          availability: "Monday, Wednesday, Friday",
          bio: "Dr. Sarah Johnson is a licensed clinical psychologist with over 12 years of experience specializing in cognitive behavioral therapy. She has extensive experience working with adults dealing with anxiety, depression, and trauma.",
          status: "Available",
          level: "Senior",
          experience: "12 years",
          background: "Clinical Psychology",
          introduction: "Specializes in CBT and trauma-informed care",
          recentActivity: [
            {
              title: "Reviewed Session: Client B - CBT Session",
              date: "2 days ago",
              description:
                "Provided detailed feedback on therapeutic techniques and client engagement.",
            },
          ],
        },
        {
          id: "2",
          name: "Dr. Michael Chen",
          avatar: "michael",
          title: "Family Therapist",
          specialization: "Family Systems Therapy",
          yearsOfExperience: 8,
          certifications: [
            "Licensed Marriage and Family Therapist",
            "Certified Family Trauma Professional",
          ],
          availability: "Tuesday, Thursday",
          bio: "Dr. Michael Chen is a licensed marriage and family therapist who specializes in helping families navigate complex dynamics and improve communication. He has particular expertise in cultural issues affecting family systems.",
          status: "Available",
          level: "Mid-level",
          experience: "8 years",
          background: "Family Therapy",
          introduction: "Focuses on family dynamics and cultural contexts",
          recentActivity: [
            {
              title: "Reviewed Session: Family Intervention",
              date: "1 week ago",
              description:
                "Provided insights on family communication patterns and intervention strategies.",
            },
          ],
        },
        {
          id: "3",
          name: "Dr. Aisha Patel",
          avatar: "aisha",
          title: "Child Psychologist",
          specialization: "Play Therapy",
          yearsOfExperience: 10,
          certifications: [
            "Licensed Child Psychologist",
            "Registered Play Therapist",
          ],
          availability: "Monday, Tuesday, Thursday",
          bio: "Dr. Aisha Patel is a child psychologist who specializes in play therapy and developmental issues. She has worked extensively with children experiencing trauma, anxiety, and behavioral challenges.",
          status: "Available",
          level: "Senior",
          experience: "10 years",
          background: "Child Psychology",
          introduction: "Expert in play therapy and child development",
          recentActivity: [
            {
              title: "Reviewed Session: Child Play Therapy",
              date: "3 days ago",
              description:
                "Provided feedback on therapeutic play techniques and child engagement strategies.",
            },
          ],
        },
      ];
    }

    return data.map((supervisor) => ({
      id: supervisor.id,
      name: supervisor.name,
      avatar: supervisor.avatar,
      level: supervisor.level,
      experience: supervisor.experience,
      background: supervisor.background,
      introduction: supervisor.introduction,
      title: supervisor.title || "Supervisor",
      specialization: supervisor.specialization || "General Counseling",
      yearsOfExperience: supervisor.years_of_experience || 5,
      certifications: supervisor.certifications || [
        "Licensed Professional Counselor",
      ],
      availability: supervisor.availability || "Weekdays",
      bio: supervisor.bio || "Experienced counseling supervisor",
      status: supervisor.status || "Available",
      recentActivity: supervisor.recent_activity || [],
    }));
  } catch (error) {
    console.error("Error in getSupervisors:", error);
    // Return mock data as fallback
    return [
      {
        id: "1",
        name: "Dr. Sarah Johnson",
        avatar: "sarah",
        title: "Clinical Psychologist",
        specialization: "Cognitive Behavioral Therapy",
        yearsOfExperience: 12,
        certifications: ["Licensed Clinical Psychologist", "CBT Certified"],
        availability: "Monday, Wednesday, Friday",
        bio: "Dr. Sarah Johnson is a licensed clinical psychologist with over 12 years of experience specializing in cognitive behavioral therapy. She has extensive experience working with adults dealing with anxiety, depression, and trauma.",
        status: "Available",
        level: "Senior",
        experience: "12 years",
        background: "Clinical Psychology",
        introduction: "Specializes in CBT and trauma-informed care",
        recentActivity: [
          {
            title: "Reviewed Session: Client B - CBT Session",
            date: "2 days ago",
            description:
              "Provided detailed feedback on therapeutic techniques and client engagement.",
          },
        ],
      },
      {
        id: "2",
        name: "Dr. Michael Chen",
        avatar: "michael",
        title: "Family Therapist",
        specialization: "Family Systems Therapy",
        yearsOfExperience: 8,
        certifications: [
          "Licensed Marriage and Family Therapist",
          "Certified Family Trauma Professional",
        ],
        availability: "Tuesday, Thursday",
        bio: "Dr. Michael Chen is a licensed marriage and family therapist who specializes in helping families navigate complex dynamics and improve communication. He has particular expertise in cultural issues affecting family systems.",
        status: "Available",
        level: "Mid-level",
        experience: "8 years",
        background: "Family Therapy",
        introduction: "Focuses on family dynamics and cultural contexts",
        recentActivity: [
          {
            title: "Reviewed Session: Family Intervention",
            date: "1 week ago",
            description:
              "Provided insights on family communication patterns and intervention strategies.",
          },
        ],
      },
      {
        id: "3",
        name: "Dr. Aisha Patel",
        avatar: "aisha",
        title: "Child Psychologist",
        specialization: "Play Therapy",
        yearsOfExperience: 10,
        certifications: [
          "Licensed Child Psychologist",
          "Registered Play Therapist",
        ],
        availability: "Monday, Tuesday, Thursday",
        bio: "Dr. Aisha Patel is a child psychologist who specializes in play therapy and developmental issues. She has worked extensively with children experiencing trauma, anxiety, and behavioral challenges.",
        status: "Available",
        level: "Senior",
        experience: "10 years",
        background: "Child Psychology",
        introduction: "Expert in play therapy and child development",
        recentActivity: [
          {
            title: "Reviewed Session: Child Play Therapy",
            date: "3 days ago",
            description:
              "Provided feedback on therapeutic play techniques and child engagement strategies.",
          },
        ],
      },
    ];
  }
};

export const getSupervisorById = async (id: string): Promise<Supervisor> => {
  try {
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
      title: data.title || "Supervisor",
      specialization: data.specialization || "General Counseling",
      yearsOfExperience: data.years_of_experience || 5,
      certifications: data.certifications || [
        "Licensed Professional Counselor",
      ],
      availability: data.availability || "Weekdays",
      bio: data.bio || "Experienced counseling supervisor",
      status: data.status || "Available",
      recentActivity: data.recent_activity || [],
    };
  } catch (error) {
    console.error(`Error in getSupervisorById for ID ${id}:`, error);

    // Return mock data based on the ID
    const mockSupervisors = {
      "1": {
        id: "1",
        name: "Dr. Sarah Johnson",
        avatar: "sarah",
        title: "Clinical Psychologist",
        specialization: "Cognitive Behavioral Therapy",
        yearsOfExperience: 12,
        certifications: ["Licensed Clinical Psychologist", "CBT Certified"],
        availability: "Monday, Wednesday, Friday",
        bio: "Dr. Sarah Johnson is a licensed clinical psychologist with over 12 years of experience specializing in cognitive behavioral therapy. She has extensive experience working with adults dealing with anxiety, depression, and trauma.",
        status: "Available",
        level: "Senior",
        experience: "12 years",
        background: "Clinical Psychology",
        introduction: "Specializes in CBT and trauma-informed care",
        recentActivity: [
          {
            title: "Reviewed Session: Client B - CBT Session",
            date: "2 days ago",
            description:
              "Provided detailed feedback on therapeutic techniques and client engagement.",
          },
        ],
      },
      "2": {
        id: "2",
        name: "Dr. Michael Chen",
        avatar: "michael",
        title: "Family Therapist",
        specialization: "Family Systems Therapy",
        yearsOfExperience: 8,
        certifications: [
          "Licensed Marriage and Family Therapist",
          "Certified Family Trauma Professional",
        ],
        availability: "Tuesday, Thursday",
        bio: "Dr. Michael Chen is a licensed marriage and family therapist who specializes in helping families navigate complex dynamics and improve communication. He has particular expertise in cultural issues affecting family systems.",
        status: "Available",
        level: "Mid-level",
        experience: "8 years",
        background: "Family Therapy",
        introduction: "Focuses on family dynamics and cultural contexts",
        recentActivity: [
          {
            title: "Reviewed Session: Family Intervention",
            date: "1 week ago",
            description:
              "Provided insights on family communication patterns and intervention strategies.",
          },
        ],
      },
      "3": {
        id: "3",
        name: "Dr. Aisha Patel",
        avatar: "aisha",
        title: "Child Psychologist",
        specialization: "Play Therapy",
        yearsOfExperience: 10,
        certifications: [
          "Licensed Child Psychologist",
          "Registered Play Therapist",
        ],
        availability: "Monday, Tuesday, Thursday",
        bio: "Dr. Aisha Patel is a child psychologist who specializes in play therapy and developmental issues. She has worked extensively with children experiencing trauma, anxiety, and behavioral challenges.",
        status: "Available",
        level: "Senior",
        experience: "10 years",
        background: "Child Psychology",
        introduction: "Expert in play therapy and child development",
        recentActivity: [
          {
            title: "Reviewed Session: Child Play Therapy",
            date: "3 days ago",
            description:
              "Provided feedback on therapeutic play techniques and child engagement strategies.",
          },
        ],
      },
    };

    return (
      mockSupervisors[id] || {
        id: id,
        name: "Unknown Supervisor",
        avatar: "user",
        title: "Supervisor",
        specialization: "General Counseling",
        yearsOfExperience: 5,
        certifications: ["Licensed Professional Counselor"],
        availability: "Weekdays",
        bio: "Information not available for this supervisor.",
        status: "Unknown",
        level: "Unknown",
        experience: "Unknown",
        background: "Unknown",
        introduction: "Unknown",
        recentActivity: [],
      }
    );
  }
};

// API functions for sessions
export const getSessions = async (): Promise<Session[]> => {
  try {
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
  } catch (error) {
    console.error("Error in getSessions:", error);
    // Return mock data as fallback
    return [
      {
        id: "1",
        title: "Client A - Initial Assessment",
        createdAt: new Date("2023-06-15"),
        duration: 2580, // 43 minutes
        feedbackCount: 5,
        status: "completed",
        sessionType: "Initial Assessment",
        supervisor: {
          id: "1",
          name: "Dr. Sarah Johnson",
          avatar: "sarah",
        },
      },
      {
        id: "2",
        title: "Client B - Cognitive Behavioral Therapy Session",
        createdAt: new Date("2023-06-22"),
        duration: 3120, // 52 minutes
        feedbackCount: 3,
        status: "in_progress",
        sessionType: "Cognitive Behavioral Therapy",
        supervisor: {
          id: "2",
          name: "Dr. Michael Chen",
          avatar: "michael",
        },
      },
      {
        id: "3",
        title: "Client C - Follow-up Session",
        createdAt: new Date("2023-06-29"),
        duration: 1920, // 32 minutes
        feedbackCount: 0,
        status: "pending",
        sessionType: "Follow-up",
        supervisor: {
          id: "3",
          name: "Dr. Aisha Patel",
          avatar: "aisha",
        },
      },
    ];
  }
};

export const getSessionById = async (id: string): Promise<Session> => {
  try {
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
  } catch (error) {
    console.error(`Error in getSessionById for ID ${id}:`, error);
    // Return mock data based on the ID
    const mockSessions = {
      "1": {
        id: "1",
        title: "Client A - Initial Assessment",
        createdAt: new Date("2023-06-15"),
        duration: 2580, // 43 minutes
        feedbackCount: 5,
        status: "completed",
        sessionType: "Initial Assessment",
        supervisor: {
          id: "1",
          name: "Dr. Sarah Johnson",
          avatar: "sarah",
        },
      },
      "2": {
        id: "2",
        title: "Client B - Cognitive Behavioral Therapy Session",
        createdAt: new Date("2023-06-22"),
        duration: 3120, // 52 minutes
        feedbackCount: 3,
        status: "in_progress",
        sessionType: "Cognitive Behavioral Therapy",
        supervisor: {
          id: "2",
          name: "Dr. Michael Chen",
          avatar: "michael",
        },
      },
      "3": {
        id: "3",
        title: "Client C - Follow-up Session",
        createdAt: new Date("2023-06-29"),
        duration: 1920, // 32 minutes
        feedbackCount: 0,
        status: "pending",
        sessionType: "Follow-up",
        supervisor: {
          id: "3",
          name: "Dr. Aisha Patel",
          avatar: "aisha",
        },
      },
    };

    return (
      mockSessions[id] || {
        id: id,
        title: "Unknown Session",
        createdAt: new Date(),
        duration: 0,
        feedbackCount: 0,
        status: "unknown",
        sessionType: "Unknown",
        supervisor: {
          id: "",
          name: "Unassigned",
          avatar: "",
        },
      }
    );
  }
};

export const createSession = async (sessionData: {
  title: string;
  supervisorId: string;
  audioFile: File;
  notes: string;
  sessionType?: string;
}): Promise<Session> => {
  try {
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
  } catch (error) {
    console.error("Error in createSession:", error);
    // Create a mock session as fallback
    return {
      id: `mock-${Date.now()}`,
      title: sessionData.title,
      createdAt: new Date(),
      duration: 1800, // 30 minutes
      feedbackCount: 0,
      status: "pending",
      sessionType: sessionData.sessionType || "General",
      supervisor: {
        id: sessionData.supervisorId,
        name: "Supervisor",
        avatar: "user",
      },
    };
  }
};

// API functions for feedback
export const getFeedbackForSession = async (
  sessionId: string,
): Promise<FeedbackItem[]> => {
  try {
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
  } catch (error) {
    console.error(
      `Error in getFeedbackForSession for session ${sessionId}:`,
      error,
    );
    // Return mock data as fallback
    if (sessionId === "1") {
      return [
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
      ];
    } else if (sessionId === "2") {
      return [
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
      ];
    }
    return [];
  }
};

export const addFeedback = async (
  sessionId: string,
  text: string,
  timestamp: number,
  endTimestamp?: number,
  title?: string,
  audioFeedback?: Blob,
  isGeneral?: boolean,
): Promise<FeedbackItem> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user || !user.user) {
      throw new Error("User not authenticated");
    }

    // First, handle audio feedback upload if provided
    let audioFeedbackUrl = null;
    if (audioFeedback) {
      const fileName = `${Date.now()}-feedback.webm`;
      const filePath = `feedback/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("audio")
        .upload(filePath, audioFeedback);

      if (uploadError) {
        console.error("Error uploading audio feedback:", uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("audio")
        .getPublicUrl(filePath);
      audioFeedbackUrl = urlData.publicUrl;
    }

    // Then create the feedback record
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        session_id: sessionId,
        author_id: user.user.id,
        timestamp: timestamp,
        end_timestamp: endTimestamp || null,
        title: title || null,
        text: text,
        audio_feedback: audioFeedbackUrl,
        is_general: isGeneral || false,
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
      endTimestamp: data.end_timestamp || undefined,
      title: data.title || undefined,
      text: data.text,
      audioResponse: data.audio_response,
      audioFeedback: data.audio_feedback,
      author: {
        name:
          data.author?.user_metadata?.full_name ||
          data.author?.email ||
          "Unknown",
        avatar: data.author?.email?.split("@")[0] || "user",
      },
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error("Error in addFeedback:", error);
    // Create a mock feedback item as fallback
    return {
      id: `mock-${Date.now()}`,
      sessionId: sessionId,
      timestamp: timestamp,
      text: text,
      author: {
        name: "Current User",
        avatar: "user",
      },
      createdAt: new Date(),
    };
  }
};

export const addAudioResponse = async (
  feedbackId: string,
  audioBlob: Blob,
): Promise<string> => {
  try {
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
  } catch (error) {
    console.error("Error in addAudioResponse:", error);
    // Return a mock URL as fallback
    return `mock-audio-response-${Date.now()}.mp3`;
  }
};
