'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    checkAuthStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Check if user is staff based on metadata
          const isStaff = session.user.user_metadata?.role === 'staff';
          if (isStaff) {
            // Fetch actual role from staff table
            await setUserWithStaffRole(session.user);
          } else {
            // Not a staff member, deny access
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          // User is signed out
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user is staff based on metadata
        const isStaff = session.user.user_metadata?.role === 'staff';
        if (isStaff) {
          // Fetch actual role from staff table
          await setUserWithStaffRole(session.user);
        } else {
          // Not a staff member, sign out
          await supabase.auth.signOut();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to set user with their actual role from staff table
  const setUserWithStaffRole = async (supabaseUser) => {
    try {
      // Fetch staff record to get actual role
      const response = await fetch(`http://localhost:5001/api/admin/employee-booking/staff?venue_id=86`);
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
            role: staffRecord.role.toLowerCase(), // Convert "Admin" to "admin"
            supabaseUser: supabaseUser
          };
          setUser(userData);
        } else {
          // Staff record doesn't exist, create one with default role
          await ensureStaffRecord(supabaseUser);
          // Retry setting user after creating staff record
          setTimeout(() => setUserWithStaffRole(supabaseUser), 1000);
        }
      }
    } catch (error) {
      console.error('Error setting user with staff role:', error);
      // Fallback: set user with basic info
      const userData = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email || supabaseUser.phone,
        email: supabaseUser.email,
        phone: supabaseUser.phone,
        role: 'staff', // Default role
        supabaseUser: supabaseUser
      };
      setUser(userData);
    }
  };

  // Function to ensure staff record exists
  const ensureStaffRecord = async (supabaseUser) => {
    try {
      const createResponse = await fetch('http://localhost:5001/api/admin/employee-booking/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: supabaseUser.id,
          full_name: supabaseUser.user_metadata?.name || supabaseUser.email || supabaseUser.phone,
          email: supabaseUser.email || '',
          role: 'Admin', // Default to Admin role in staff table
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

      // Check if user has staff role in metadata
      const userRole = result.data.user?.user_metadata?.role;
      if (userRole !== 'staff') {
        await supabase.auth.signOut();
        return { success: false, error: 'Access denied. Staff access required.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    userRole: user?.role || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 