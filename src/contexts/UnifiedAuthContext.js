'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { mapDatabaseRoleToPermissionRole } from '../utils/roles';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const UnifiedAuthContext = createContext();

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

export const UnifiedAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'staff' or 'customer'

  // Get customer data from database
  const getCustomerData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching customer data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCustomerData:', error);
      return null;
    }
  };

  // Set user with their staff role from staff table
  const setUserWithStaffRole = async (supabaseUser, retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      // Add a small delay to ensure backend is ready
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
      
      // Fetch staff record to get actual role
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const url = `${BASE_URL}/api/admin/employee-booking/staff?venue_id=86`;
      console.log('🔍 Fetching staff data from:', url);
      console.log('🔍 BASE_URL:', BASE_URL);
      console.log('🔍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('🔍 Response status:', response.status, response.statusText);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const staffList = await response.json();
        const staffRecord = staffList.find(staff => staff.id === supabaseUser.id);
        
        if (staffRecord) {
          // User exists in staff table, set user with actual role
          const userData = {
            id: supabaseUser.id,
            name: staffRecord.full_name,
            email: staffRecord.email || supabaseUser.email,
            phone: supabaseUser.phone,
            role: mapDatabaseRoleToPermissionRole(staffRecord.role),
            databaseRole: staffRecord.role, // Keep original database role
            supabaseUser: supabaseUser
          };
          setUser(userData);
          setUserType('staff');
          return; // Success, exit function
        } else {
          // Staff record doesn't exist, create one with default role
          await ensureStaffRecord(supabaseUser);
          // Retry setting user after creating staff record
          setTimeout(() => setUserWithStaffRole(supabaseUser, 0), 1000);
          return;
        }
      } else {
        const errorText = await response.text();
        console.log('🔍 Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error setting user with staff role (attempt ${retryCount + 1}):`, error);
      
      // Retry if we haven't exceeded max retries and it's a network error
      if (retryCount < maxRetries && (error.name === 'AbortError' || error.name === 'TypeError' || error.message.includes('fetch'))) {
        console.log(`Retrying staff data fetch in ${(retryCount + 1) * 1000}ms...`);
        setTimeout(() => setUserWithStaffRole(supabaseUser, retryCount + 1), (retryCount + 1) * 1000);
        return;
      }
      
      // Fallback: set user with basic info after all retries failed
      console.log('All retries failed, using fallback user data');
      const userData = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email || supabaseUser.phone,
        email: supabaseUser.email,
        phone: supabaseUser.phone,
        role: 'staff',
        supabaseUser: supabaseUser
      };
      setUser(userData);
      setUserType('staff');
    }
  };

  // Set user with customer data
  const setUserWithCustomerData = async (authUser) => {
    if (!authUser) {
      setUser(null);
      setCustomer(null);
      setUserType(null);
      return;
    }

    setUser(authUser);
    setUserType('customer');
    
    // Get customer data
    const customerData = await getCustomerData(authUser.id);
    setCustomer(customerData);
  };

  // Function to ensure staff record exists
  const ensureStaffRecord = async (supabaseUser) => {
    try {
      const createResponse = await fetch(`${BASE_URL}/api/admin/employee-booking/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: supabaseUser.id,
          full_name: supabaseUser.user_metadata?.name || supabaseUser.email || supabaseUser.phone,
          email: supabaseUser.email || '',
          role: 'Admin',
          status: 'active',
          venue_id: 86
        }),
      });
      
      if (createResponse.ok) {
        console.log('Staff record created for user:', supabaseUser.id);
      } else {
        console.error('Failed to create staff record:', await createResponse.text());
      }
    } catch (error) {
      console.error('Error ensuring staff record:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isStaff = session.user.user_metadata?.role === 'staff';
          if (isStaff) {
            await setUserWithStaffRole(session.user);
          } else {
            await setUserWithCustomerData(session.user);
          }
        } else {
          setUser(null);
          setCustomer(null);
          setUserType(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const isStaff = session.user.user_metadata?.role === 'staff';
          if (isStaff) {
            await setUserWithStaffRole(session.user);
          } else {
            await setUserWithCustomerData(session.user);
          }
        } else {
          setUser(null);
          setCustomer(null);
          setUserType(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (identifier, password) => {
    try {
      setLoading(true);
      
      // Determine if identifier is email or phone
      const isEmail = identifier.includes('@');
      
      let result;
      if (isEmail) {
        result = await supabase.auth.signInWithPassword({
          email: identifier,
          password: password,
        });
      } else {
        // Format phone number (remove any non-digits and add + if needed)
        const formattedPhone = identifier.startsWith('+') 
          ? identifier 
          : `+${identifier.replace(/\D/g, '')}`;
        
        result = await supabase.auth.signInWithPassword({
          phone: formattedPhone,
          password: password,
        });
      }

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      // Determine user type and redirect URL based on role metadata
      const userRole = result.data.user?.user_metadata?.role;
      
      if (userRole === 'staff') {
        return { 
          success: true, 
          userType: 'staff',
          redirectTo: '/admin'
        };
      } else {
        return { 
          success: true, 
          userType: 'customer',
          redirectTo: '/customer/dashboard'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, fullName, phoneNumber) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/customer/dashboard`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Create customer record if signup successful
      if (data.user) {
        const { error: customerError } = await supabase
          .from('customers')
          .insert([{
            id: data.user.id,
            full_name: fullName,
            phone_number: phoneNumber,
            created_at: new Date().toISOString()
          }]);

        if (customerError) {
          console.error('Error creating customer record:', customerError);
          // Don't fail the signup if customer record creation fails
        }
      }

      return { 
        success: true, 
        user: data.user,
        message: 'Signup successful! Please check your email to verify your account.'
      };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCustomer(null);
      setUserType(null);
      // Redirect to unified login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateCustomerProfile = async (updates) => {
    try {
      if (!user || userType !== 'customer') return { success: false, error: 'Not authenticated as customer' };

      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      setCustomer(data);
      return { success: true, customer: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    customer,
    login,
    signup,
    logout,
    updateCustomerProfile,
    loading,
    userType,
    isAuthenticated: !!user,
    isStaff: userType === 'staff',
    isCustomer: userType === 'customer',
    userRole: user?.role || null,
    // Add session getter for components that need access to the full session
    getSession: () => supabase.auth.getSession()
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}; 