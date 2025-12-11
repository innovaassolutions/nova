const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  const email = 'todd.abraham@innovaas.co';

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  });

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('\n✅ Password reset link generated!');
  console.log('\nUse this link to set your password:');
  console.log(data.properties.action_link);
  console.log('\n');
}

resetPassword();
