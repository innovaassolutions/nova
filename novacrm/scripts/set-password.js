const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function setPassword() {
  const password = 'TempAdmin123!'; // Temporary password

  const { data, error } = await supabase.auth.admin.updateUserById(
    'f0cb83cb-f863-46d7-93cb-83935a91cd08', // todd.abraham@innovaas.co user ID
    { password: password }
  );

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Password set successfully');
  console.log('Email: todd.abraham@innovaas.co');
  console.log('Password:', password);
  console.log('\nPlease change this password after logging in.');
}

setPassword();
