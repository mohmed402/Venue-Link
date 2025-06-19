require("dotenv").config();
const supabase = require("./supabaseClient");

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      phone: '+4477678619811',
      password: '123456789',
      user_metadata: { role: 'staff' },
      phone_confirm: true
    });

    if (error) {
      console.error('Error creating user:', error);
      return;
    }

    console.log('User created successfully:', data);
    console.log('User ID:', data.user?.id);
    console.log('Phone:', data.user?.phone);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the function
createTestUser();