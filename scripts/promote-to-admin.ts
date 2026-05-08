import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function promoteUser(email: string) {
  console.log(`Searching for user with email: ${email}...`);

  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError.message);
    return;
  }

  const user = users.users.find((u) => u.email === email);

  if (!user) {
    console.error(`User with email ${email} not found.`);
    return;
  }

  console.log(`Found user: ${user.id}. Promoting to ADMIN...`);

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, role: "ADMIN" },
  });

  if (error) {
    console.error("Error updating user metadata:", error.message);
  } else {
    console.log(`Successfully promoted ${email} to ADMIN!`);
    console.log("New user metadata:", data.user.user_metadata);
  }
}

const emailArg = process.argv[2];
if (!emailArg) {
  console.error("Please provide an email address as an argument.");
  console.log("Usage: npx tsx scripts/promote-to-admin.ts user@example.com");
  process.exit(1);
}

promoteUser(emailArg);
