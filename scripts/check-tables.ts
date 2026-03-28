
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: tables, error: tableError } = await supabase.from('profiles').select('*').limit(1);
  if (tableError) {
      console.log("Profiles table not found or error:", tableError.message);
  } else {
      console.log("Profiles table found.");
  }
}

run();
