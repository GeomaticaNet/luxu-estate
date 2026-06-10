import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Error fetching buckets:", error);
  } else {
    console.log("Buckets:", data.map(b => b.name));
    
    // Check if properties exists
    const hasProperties = data.some(b => b.name === 'properties');
    if (!hasProperties) {
      console.log("Bucket 'properties' does not exist. Creating it...");
      const { data: createData, error: createError } = await supabase.storage.createBucket('properties', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      });
      if (createError) {
        console.error("Error creating bucket:", createError);
      } else {
        console.log("Bucket created successfully:", createData);
      }
    } else {
      console.log("Bucket 'properties' already exists.");
    }
  }
}

main();
