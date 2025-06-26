import { supabase } from '../lib/supabase';

interface UserSetupResult {
  success: boolean;
  message: string;
  error?: string;
}

export const createAdminUser = async (): Promise<UserSetupResult> => {
  try {
    console.log('Creating admin user...');
    
    // Create the auth user for admin
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'worldecare@gmail.com',
      password: 'Rohan@123',
    });

    if (authError) {
      console.error('Auth error:', authError);
      return { success: false, message: 'Failed to create auth user', error: authError.message };
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
        return { success: false, message: 'Failed to create user profile', error: profileError.message };
      }

      return { success: true, message: 'Admin user created successfully' };
    }

    return { success: false, message: 'No user data returned' };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, message: 'Failed to create admin user', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const createProviderUser = async (): Promise<UserSetupResult> => {
  try {
    console.log('Creating provider user...');
    
    // Create the auth user for provider
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'nexterplus.com@gmail.com',
      password: 'Rohan@123',
    });

    if (authError) {
      console.error('Auth error:', authError);
      return { success: false, message: 'Failed to create auth user', error: authError.message };
    }

    if (authData.user) {
      // Create the user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: 'nexterplus.com@gmail.com',
            full_name: 'Test Provider',
            user_type: 'provider',
            status: 'approved'
          }
        ]);

      if (profileError) {
        console.error('Profile error:', profileError);
        return { success: false, message: 'Failed to create user profile', error: profileError.message };
      }

      // Create service provider profile
      const { error: providerError } = await supabase
        .from('service_providers')
        .insert([
          {
            user_id: authData.user.id,
            name: 'Test Provider Services',
            category: 'RO Technician',
            description: 'Professional RO technician with 5+ years experience',
            contact: '+91 98765 43210',
            location: 'Sitabuldi, Nagpur, Maharashtra',
            available: true
          }
        ]);

      if (providerError) {
        console.error('Provider profile error:', providerError);
        return { success: false, message: 'Failed to create provider profile', error: providerError.message };
      }

      return { success: true, message: 'Provider user created successfully' };
    }

    return { success: false, message: 'No user data returned' };
  } catch (error) {
    console.error('Error creating provider user:', error);
    return { success: false, message: 'Failed to create provider user', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const createCustomerUser = async (): Promise<UserSetupResult> => {
  try {
    console.log('Creating customer user...');
    
    // Create the auth user for customer (using admin email as customer for testing)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'customer@mcgs.com',
      password: 'Rohan@123',
    });

    if (authError) {
      console.error('Auth error:', authError);
      return { success: false, message: 'Failed to create auth user', error: authError.message };
    }

    if (authData.user) {
      // Create the user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: 'customer@mcgs.com',
            full_name: 'Test Customer',
            user_type: 'customer',
            status: 'approved'
          }
        ]);

      if (profileError) {
        console.error('Profile error:', profileError);
        return { success: false, message: 'Failed to create user profile', error: profileError.message };
      }

      return { success: true, message: 'Customer user created successfully' };
    }

    return { success: false, message: 'No user data returned' };
  } catch (error) {
    console.error('Error creating customer user:', error);
    return { success: false, message: 'Failed to create customer user', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const clearAuthUsers = async (): Promise<UserSetupResult> => {
  try {
    console.log('Clearing auth users...');
    
    // Note: We cannot directly delete auth.users from the client
    // This would need to be done via Supabase admin API or dashboard
    // For now, we'll just clear the users table
    
    const { error } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all users

    if (error) {
      console.error('Error clearing users:', error);
      return { success: false, message: 'Failed to clear users', error: error.message };
    }

    return { success: true, message: 'Users cleared successfully' };
  } catch (error) {
    console.error('Error clearing users:', error);
    return { success: false, message: 'Failed to clear users', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const setupAllUsers = async (): Promise<UserSetupResult> => {
  try {
    console.log('Setting up all users...');
    
    // Clear existing users first
    await clearAuthUsers();
    
    // Create admin user
    const adminResult = await createAdminUser();
    if (!adminResult.success) {
      return adminResult;
    }
    
    // Create provider user
    const providerResult = await createProviderUser();
    if (!providerResult.success) {
      return providerResult;
    }
    
    // Create customer user
    const customerResult = await createCustomerUser();
    if (!customerResult.success) {
      return customerResult;
    }
    
    return { success: true, message: 'All users created successfully' };
  } catch (error) {
    console.error('Error setting up users:', error);
    return { success: false, message: 'Failed to setup users', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};