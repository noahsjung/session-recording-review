import { supabase } from "@/supabase/supabase";

// Create necessary buckets if they don't exist
export const createStorageBuckets = async () => {
  // Create audio bucket for session recordings and feedback audio responses
  const { data: audioBucket, error: audioBucketError } =
    await supabase.storage.createBucket("audio", { public: true });

  if (
    audioBucketError &&
    audioBucketError.message !== "Bucket already exists"
  ) {
    console.error("Error creating audio bucket:", audioBucketError);
    throw audioBucketError;
  }

  console.log("Storage buckets initialized");
};

// Initialize storage
export const initializeStorage = async () => {
  try {
    await createStorageBuckets();
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
};
