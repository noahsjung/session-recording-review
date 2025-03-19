import { createClient } from "@supabase/supabase-js";

// Use explicit environment variables from process.env for reliability
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check if the environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials. Please check your .env file.");
}

// Create and export a mock client that won't throw errors if Supabase is unavailable
const createMockClient = () => {
  const mockMethods = {
    from: () => mockMethods,
    select: () => mockMethods,
    insert: () => Promise.resolve({ data: null, error: { message: "Supabase unavailable" } }),
    update: () => Promise.resolve({ data: null, error: { message: "Supabase unavailable" } }),
    delete: () => Promise.resolve({ data: null, error: { message: "Supabase unavailable" } }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase unavailable" } }),
      signUp: () => Promise.resolve({ data: null, error: { message: "Supabase unavailable" } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    storage: {
      createBucket: () => Promise.resolve({ data: null, error: { message: "Supabase unavailable" } }),
      getBucket: () => Promise.resolve({ data: null, error: { message: "Supabase unavailable" } }),
      listBuckets: () => Promise.resolve({ data: [], error: null }),
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: "Supabase unavailable" } }),
        list: () => Promise.resolve({ data: [], error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
      }),
    }
  };
  
  return mockMethods;
};

// Create the actual Supabase client
let realSupabase: any;
try {
  realSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  console.log("Supabase client created successfully");
} catch (err) {
  console.error("Failed to create Supabase client:", err);
  realSupabase = createMockClient();
}

// Export the client - either real or mock
export const supabase = realSupabase;

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