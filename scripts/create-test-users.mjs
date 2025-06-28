// scripts/create-test-users.mjs
// Creates test users using Supabase Admin API
// Usage: node scripts/create-test-users.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file manually
function loadEnvFile() {
  try {
    const envPath = join(__dirname, "..", ".env");
    const envFile = readFileSync(envPath, "utf8");

    envFile.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, ""); // Remove quotes
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.warn("Could not load .env file:", error.message);
  }
}

// Load environment variables
loadEnvFile();

const supabaseUrl = process.env.SUPABASE_PUBLIC_URL || "http://localhost:8000";
const supabaseServiceKey = process.env.SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("SERVICE_ROLE_KEY environment variable is required");
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: "admin@example.org",
    password: "admin123",
    user_metadata: {
      name: "Admin User",
      role: "admin",
    },
  },
  {
    email: "test@example.com",
    password: "test123",
    user_metadata: {
      name: "Test User",
    },
  },
];

async function createTestUsers() {
  console.log("Creating test users...");

  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const userExists = existingUsers?.users?.some(
        (u) => u.email === userData.email
      );

      if (userExists) {
        console.log(`✓ User ${userData.email} already exists, skipping`);
        continue;
      }

      // Create new user
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true, // Auto-confirm email
      });

      if (error) {
        console.error(
          `✗ Failed to create user ${userData.email}:`,
          error.message
        );
      } else {
        console.log(`✓ Created user: ${userData.email} (ID: ${data.user?.id})`);
      }
    } catch (err) {
      console.error(`✗ Error creating user ${userData.email}:`, err.message);
    }
  }

  console.log("Test user creation complete!");
}

// Run the script
createTestUsers().catch(console.error);
