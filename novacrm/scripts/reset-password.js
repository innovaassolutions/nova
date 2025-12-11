const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: 'todd.abraham@innovaas.co',
    options: {
      redirectTo: 'https://nova-cyan-mu.vercel.app/auth/callback'
    }
  });

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log(data.properties.action_link);
}

resetPassword();
