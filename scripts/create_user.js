const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUser() {
  console.log('Creating user...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'assesssoriavittus@gmail.com',
    password: '@Vittus@26',
    email_confirm: true,
    user_metadata: {
      nome: 'Equipe Vittus'
    }
  });

  if (error) {
    console.error('Error creating user:', error);
  } else {
    console.log('User created successfully:', data.user.email);
  }
}

createUser();
