import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type UserRole = "counselor" | "supervisor" | "admin";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: string,
    supervisorLevel?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isSupervisor: () => boolean;
  isApprovedSupervisor: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string = "counselor",
    supervisorLevel: string = "",
  ) => {
    // Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          supervisor_level: supervisorLevel,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Create a profile record
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: data.user.id,
          full_name: fullName,
          role: role,
          supervisor_level: supervisorLevel || null,
          is_approved: role !== "supervisor", // Only supervisors need approval
        });

      if (profileError) throw profileError;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const isAdmin = () => {
    return user?.user_metadata?.role === "admin";
  };

  const isSupervisor = () => {
    return user?.user_metadata?.role === "supervisor";
  };

  const isApprovedSupervisor = async () => {
    if (!isSupervisor() || !user) return false;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("is_approved")
      .eq("id", user.id)
      .single();

    return data?.is_approved === true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin,
        isSupervisor,
        isApprovedSupervisor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
