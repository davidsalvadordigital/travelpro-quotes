
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const email = "testuser@travelpro.com";
  const password = "Password123!";

  console.log(`Checking if user ${email} exists...`);
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  let user = users.find(u => u.email === email);

  if (user) {
    console.log(`User already exists ID: ${user.id}`);
  } else {
    console.log(`Creating user ${email}...`);
    const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return;
    }
    user = newUser as any;
    console.log(`User created ID: ${user!.id}`);
  }

  // Check if profile exists
  console.log("Checking profile...");
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  if (profileError || !profile) {
    console.log("Profile not found, creating default profile...");
    // We need to know the fields. Let's try to insert with just ID.
    const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user!.id, full_name: 'Test Sprite User' });
    
    if (insertError) {
        console.error("Error creating profile:", insertError.message);
    } else {
        console.log("Profile created.");
    }
  } else {
    console.log("Profile already exists.");
  }
}

run();
