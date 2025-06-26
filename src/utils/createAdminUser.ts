import { supabase } from '../lib/supabase';

export const createAdminUser = async () => {
  try {
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'worldecare@gmail.com',
      password: 'admin123456',
    });

    if (authError) {
      console.error('Auth error:', authError);
      return { success: false, error: authError.message };
    }

    if (authData.user) {
      // Create the user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: 'worldecare@gmail.com',
            full_name: 'MCGS Admin',
            user_type: 'admin',
            status: 'approved'
          }
        ]);

      if (profileError) {
        console.error('Profile error:', profileError);
        return { success: false, error: profileError.message };
      }

      return { success: true, message: 'Admin user created successfully' };
    }

    return { success: false, error: 'No user data returned' };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, error: 'Failed to create admin user' };
  }
};