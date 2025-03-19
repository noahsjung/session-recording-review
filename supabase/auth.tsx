import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * UserRole Type
 * Defines the possible user roles in the application.
 */
type UserRole = "counselor" | "supervisor" | "admin";

/**
 * AuthContextType
 * Defines the shape of the authentication context that will be
 * available throughout the application.
 */
type AuthContextType = {
  // Current authenticated user (or null if not logged in)
  user: User | null;
  // Whether authentication is still being checked
  loading: boolean;
  // Function to sign in with email and password
  signIn: (email: string, password: string) => Promise<void>;
  // Function to create a new account
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: string,
    supervisorLevel?: string,
  ) => Promise<void>;
  // Function to sign out
  signOut: () => Promise<void>;
  // Function to check if the current user is an admin
  isAdmin: () => boolean;
  // Function to check if the current user is a supervisor
  isSupervisor: () => boolean;
  // Function to check if the current user is an approved supervisor
  isApprovedSupervisor: () => Promise<boolean>;
};

// Create a context for authentication data
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * This component manages the authentication state for the entire application.
 * It provides login, signup, and logout functionality, as well as user role checking.
 * 
 * @param {React.ReactNode} children - The components that will have access to auth data
 * @returns A provider component with authentication state and functions
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State to store the current user
  const [user, setUser] = useState<User | null>(null);
  // State to track if auth is still loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When the component mounts, check if there's an active session
    const initializeAuth = async () => {
      // Check if there is an existing session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initializeAuth();

    // Listen for authentication state changes (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Update our state when auth state changes
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign Up Function
   * 
   * Creates a new user account and profile in the database.
   * Different user roles have different default settings.
   * 
   * @param email - User's email address
   * @param password - User's password
   * @param fullName - User's full name
   * @param role - User's role (defaults to "counselor")
   * @param supervisorLevel - Level for supervisors (optional)
   */
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string = "counselor",
    supervisorLevel: string = "",
  ) => {
    // Step 1: Create the authentication user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store additional user data in the metadata
        data: {
          full_name: fullName,
          role: role,
          supervisor_level: supervisorLevel,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Step 2: Create a profile record in our database
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: data.user.id,
          full_name: fullName,
          role: role,
          supervisor_level: supervisorLevel || null,
          // Supervisors require approval before they can access features
          is_approved: role !== "supervisor", 
        });

      if (profileError) throw profileError;
    }
  };

  /**
   * Sign In Function
   * 
   * Authenticates a user with email and password.
   * 
   * @param email - User's email address
   * @param password - User's password
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  /**
   * Sign Out Function
   * 
   * Logs out the current user.
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  /**
   * Is Admin Function
   * 
   * Checks if the current user has admin role.
   * 
   * @returns true if the user is an admin, false otherwise
   */
  const isAdmin = (): boolean => {
    return user?.user_metadata?.role === "admin" || false;
  };

  /**
   * Is Supervisor Function
   * 
   * Checks if the current user has supervisor role.
   * 
   * @returns true if the user is a supervisor, false otherwise
   */
  const isSupervisor = (): boolean => {
    return user?.user_metadata?.role === "supervisor" || false;
  };

  /**
   * Is Approved Supervisor Function
   * 
   * Checks if a supervisor has been approved by an admin.
   * Supervisors need approval before they can access supervisor features.
   * 
   * @returns Promise that resolves to true if supervisor is approved
   */
  const isApprovedSupervisor = async (): Promise<boolean> => {
    // If not a supervisor or not logged in, return false
    if (!isSupervisor() || !user) return false;

    // Check the database to see if the supervisor is approved
    const { data, error } = await supabase
      .from("user_profiles")
      .select("is_approved")
      .eq("id", user.id)
      .single();

    return data?.is_approved === true;
  };

  // Provide all auth-related functions and state to child components
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

/**
 * useAuth Hook
 * 
 * Custom hook to easily access authentication context in any component.
 * 
 * @returns The authentication context with user data and auth functions
 * @throws Error if used outside an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
