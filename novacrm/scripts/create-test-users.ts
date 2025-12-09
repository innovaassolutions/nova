/**
 * Create Test Users Script
 *
 * This script creates test users for development and testing purposes.
 * Uses Supabase client-side signUp to properly hash passwords and create accounts.
 *
 * Usage:
 * npx ts-node scripts/create-test-users.ts
 *
 * Or run via npm script:
 * npm run create-test-users
 *
 * Test Users Created:
 * 1. test@innovaas.com (password: Test123!)
 * 2. admin@innovaas.com (password: Admin123!)
 * 3. demo@innovaas.com (password: Demo123!)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase admin client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: 'test@innovaas.com',
    password: 'Test123!',
    metadata: {
      full_name: 'Test User',
      role: 'user',
    },
  },
  {
    email: 'admin@innovaas.com',
    password: 'Admin123!',
    metadata: {
      full_name: 'Admin User',
      role: 'admin',
    },
  },
  {
    email: 'demo@innovaas.com',
    password: 'Demo123!',
    metadata: {
      full_name: 'Demo User',
      role: 'user',
    },
  },
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');

  for (const user of testUsers) {
    try {
      // Create user with auto-confirm (bypasses email confirmation)
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.metadata,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⚠️  User ${user.email} already exists`);
        } else {
          console.error(`❌ Error creating ${user.email}:`, error.message);
        }
      } else {
        console.log(`✅ Created user: ${user.email}`);
        console.log(`   Password: ${user.password}`);
        console.log(`   ID: ${data.user?.id}\n`);
      }
    } catch (err) {
      console.error(`❌ Unexpected error creating ${user.email}:`, err);
    }
  }

  console.log('\n✨ Test user creation complete!');
  console.log('\n📝 You can now use these credentials to test the login page:');
  testUsers.forEach((user) => {
    console.log(`   ${user.email} / ${user.password}`);
  });
}

createTestUsers().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
