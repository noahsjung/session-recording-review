import { supabase } from "@/supabase/supabase";

// Re-export the client from src/supabase/supabase.ts
export { supabase };

// Test the connection
export const testSupabaseConnection = async () => {
  try {
    // Set a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout")), 5000);
    });
    
    const connectionPromise = supabase.auth.getSession();
    
    // Race between timeout and actual connection
    const { data, error } = await Promise.race([
      connectionPromise,
      timeoutPromise
    ]) as any;
    
    if (error) {
      console.error("Error connecting to Supabase:", error.message);
      return false;
    }
    console.log("Successfully connected to Supabase");
    return true;
  } catch (err) {
    console.error("Exception connecting to Supabase:", err);
    return false;
  }
}; 