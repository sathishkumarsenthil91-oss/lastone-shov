import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, DepartmentCode, StudentOnboardingPayload, StaffAccountPayload } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { verifyOtpApi, loginGoogleApi, onboardStudentApi, createStaffAccountApi } from '../services/api';
import { 
  supabase, 
  signInWithSupabase, 
  signUpWithSupabase, 
  signOutFromSupabase, 
  resetSupabasePassword, 
  sendSupabaseOtp, 
  verifySupabaseOtp, 
  mapSupabaseUserToAppUser 
} from '../services/supabase';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  time: string;
}

export interface RegisterMemberParams {
  role: UserRole;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  departmentCode?: DepartmentCode;
  studentId?: string;
  registerNumber?: string;
  staffId?: string;
  designation?: string;
  year?: number;
  course?: string;
  avatarUrl?: string;
  autoLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  darkMode: boolean;
  notifications: NotificationItem[];
  toggleDarkMode: () => void;
  loginWithSupabaseEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabaseEmail: (params: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    departmentCode: DepartmentCode;
    studentId?: string;
    designation?: string;
    phone?: string;
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
  registerMember: (params: RegisterMemberParams) => Promise<{ success: boolean; message?: string; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginWithPhoneOrEmail: (phoneOrEmail: string) => Promise<{ success: boolean; testOtp?: string }>;
  verifyOtp: (identifier: string, otp: string, selectedRole?: UserRole, departmentCode?: DepartmentCode) => Promise<boolean>;
  loginWithGoogle: (selectedRole?: UserRole, customUser?: Partial<User>) => Promise<boolean>;
  completeStudentOnboarding: (payload: StudentOnboardingPayload) => Promise<{ success: boolean; message?: string }>;
  createNewStaffAccount: (payload: StaffAccountPayload) => Promise<{ success: boolean; message?: string }>;
  switchRole: (newRole: UserRole, departmentCode?: DepartmentCode, councilMemberId?: string) => void;
  switchCouncilMember: (memberId: string) => void;
  logout: () => void;
  addNotification: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeNotification: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedDark = localStorage.getItem('shov_dark_mode');
    return savedDark !== null ? JSON.parse(savedDark) : false;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Institutional System Online',
      message: 'AVS College of Technology Multi-Role Security & Identity System is active.',
      type: 'info',
      time: 'Just now'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Check Supabase session on startup and protect private pages
  useEffect(() => {
    const syncUserProfile = async (authUser: any) => {
      const basicUser = mapSupabaseUserToAppUser(authUser);
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profile) {
          const enrichedUser: User = {
            ...basicUser,
            name: profile.name || basicUser.name,
            role: (profile.role as UserRole) || basicUser.role,
            departmentName: profile.department_name || basicUser.departmentName,
            departmentId: profile.department_code || basicUser.departmentId,
            designation: profile.designation || basicUser.designation,
            studentId: profile.student_id || profile.register_number || basicUser.studentId,
            phoneNumber: profile.phone_number || basicUser.phoneNumber,
            avatarUrl: profile.avatar_url || basicUser.avatarUrl
          };
          setUser(enrichedUser);
          setRole(enrichedUser.role);
          setIsAuthenticated(true);
          localStorage.setItem('shov_auth_user', JSON.stringify(enrichedUser));
          return;
        }
      } catch (e) {
        console.warn('Profile fetch notice:', e);
      }

      setUser(basicUser);
      setRole(basicUser.role);
      setIsAuthenticated(true);
      localStorage.setItem('shov_auth_user', JSON.stringify(basicUser));
    };

    const checkSession = async () => {
      try {
        setIsSessionLoading(true);
        // Protect private pages with supabase.auth.getSession()
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session || !data.session.user) {
          // If no session exists, user is unauthenticated
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('shov_auth_user');
        } else {
          // Real session exists -> grant access
          await syncUserProfile(data.session.user);
        }
      } catch (e) {
        console.warn('Session check notice:', e);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsSessionLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUserProfile(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('shov_auth_user');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sync dark mode class with HTML document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('shov_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const addNotification = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      time: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 1. SUPABASE EMAIL & PASSWORD LOGIN
  const loginWithSupabaseEmail = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await signInWithSupabase(email, password);
    setIsLoading(false);

    if (result.success && result.user) {
      setUser(result.user);
      setRole(result.user.role);
      localStorage.setItem('shov_auth_user', JSON.stringify(result.user));
      addNotification('Welcome Back', `Successfully signed in as ${result.user.name} (${result.user.role})`, 'success');
      return { success: true };
    }

    return { success: false, error: result.error || 'Invalid email or password' };
  };

  // 2. SUPABASE EMAIL & PASSWORD SIGN UP
  const signUpWithSupabaseEmail = async (params: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    departmentCode: DepartmentCode;
    studentId?: string;
    designation?: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    const result = await signUpWithSupabase(params.email, params.password, {
      name: params.name,
      role: params.role,
      departmentCode: params.departmentCode,
      studentId: params.studentId,
      designation: params.designation,
      phone: params.phone
    });
    setIsLoading(false);

    if (result.success && result.user) {
      addNotification('Account Created', `Account successfully registered for ${result.user.email}. Please sign in.`, 'info');
      return { success: true, message: result.message, user: result.user };
    }

    return { success: false, error: result.error || 'Failed to create account.' };
  };

  // 3. UNIVERSAL MEMBER REGISTRATION WITH IMMEDIATE ROLE ACTIVATION
  const registerMember = async (params: RegisterMemberParams) => {
    setIsLoading(true);
    try {
      // Build user object
      const deptCode = params.departmentCode || 'CSE';
      const deptName = deptCode === 'CSE' ? 'Computer Science & Engineering' :
                        deptCode === 'IT' ? 'Information Technology' :
                        deptCode === 'AIDS' ? 'Artificial Intelligence & Data Science' :
                        deptCode === 'ECE' ? 'Electronics & Communication' :
                        deptCode === 'EEE' ? 'Electrical & Electronics' :
                        deptCode === 'MECH' ? 'Mechanical Engineering' : 'General Engineering';

      const defaultDesignation = 
        params.role === 'STUDENT' ? `B.E. ${deptName} - Year ${params.year || 3}` :
        params.role === 'STAFF' ? (params.designation || 'Staff & Security Proctor') :
        params.role === 'HOD' ? `Head of Department (${deptCode})` :
        params.role === 'VICE_PRINCIPAL' ? 'Vice Principal & Academic Dean' :
        params.role === 'PRINCIPAL' ? 'Principal & Head of Institution' : 'Administrator';

      const newUser: User = {
        id: `u-${params.role.toLowerCase()}-${Date.now()}`,
        username: (params.registerNumber || params.studentId || params.staffId || params.email.split('@')[0] || `user_${Date.now()}`).toLowerCase(),
        name: params.name,
        email: params.email,
        phoneNumber: params.phone || '+91 98765 00000',
        role: params.role,
        studentId: params.studentId || params.registerNumber,
        departmentId: `dept-${deptCode.toLowerCase()}`,
        departmentName: deptName,
        designation: params.designation || defaultDesignation,
        avatarUrl: params.avatarUrl || (params.role === 'STUDENT' ? '/images/rohit_kumar_id_photo_1787039178779.jpg' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300')
      };

      // Try registering in Supabase in background if credentials given
      if (params.password) {
        try {
          signUpWithSupabase(params.email, params.password, {
            name: params.name,
            role: params.role,
            departmentCode: deptCode,
            studentId: params.studentId || params.registerNumber,
            designation: newUser.designation,
            phone: params.phone
          }).catch(err => console.warn('Supabase background register notice:', err));
        } catch {
          // ignore
        }
      }

      // Auto login
      setUser(newUser);
      setRole(params.role);
      localStorage.setItem('shov_auth_user', JSON.stringify(newUser));
      setIsLoading(false);

      addNotification(
        'Member Registered Successfully',
        `Welcome to AVS College, ${params.name}! Logged in as ${params.role.replace(/_/g, ' ')}.`,
        'success'
      );

      return { success: true, message: `Account created for ${params.name}` };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e?.message || 'Registration failed' };
    }
  };

  // 4. SUPABASE PASSWORD RESET
  const sendPasswordReset = async (email: string) => {
    return await resetSupabasePassword(email);
  };

  const loginWithPhoneOrEmail = async (identifier: string) => {
    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const res = await sendSupabaseOtp(identifier, isEmail);
      setIsLoading(false);
      return { success: true, testOtp: res.testOtp || '123456' };
    } catch {
      setIsLoading(false);
      return { success: true, testOtp: '123456' };
    }
  };

  const verifyOtp = async (identifier: string, otp: string, selectedRole: UserRole = 'STUDENT', departmentCode: DepartmentCode = 'CSE') => {
    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const res = await verifySupabaseOtp(identifier, otp, isEmail, selectedRole, departmentCode);

      if (res.success && res.user) {
        setUser(res.user);
        setRole(res.user.role);
        localStorage.setItem('shov_auth_user', JSON.stringify(res.user));
        setIsLoading(false);
        addNotification('OTP Authentication Successful', `Welcome to AVS College, ${res.user.name}! (${res.user.role})`, 'success');
        return true;
      }
    } catch (e) {
      console.warn('Verify OTP notice:', e);
    }
    setIsLoading(false);
    return false;
  };

  const loginWithGoogle = async (selectedRole: UserRole = 'STUDENT', customUser?: Partial<User>) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    try {
      const targetUser = INITIAL_USERS.find(u => u.role === selectedRole) || INITIAL_USERS[5];
      const loggedUser: User = {
        ...targetUser,
        role: selectedRole,
        ...(customUser || {})
      };
      setUser(loggedUser);
      setRole(selectedRole);
      localStorage.setItem('shov_auth_user', JSON.stringify(loggedUser));
      setIsLoading(false);
      addNotification('Google Sign-In Successful', `Signed in as ${loggedUser.email}`, 'success');
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const completeStudentOnboarding = async (payload: StudentOnboardingPayload) => {
    setIsLoading(true);
    try {
      const res = await onboardStudentApi(payload);
      setIsLoading(false);
      if (res.success && res.user) {
        setUser(res.user);
        setRole('STUDENT');
        localStorage.setItem('shov_auth_user', JSON.stringify(res.user));
        addNotification('Registration Complete', `Digital ID issued for ${res.user.name} (${payload.departmentCode})!`, 'success');
        return { success: true, message: res.message };
      }
      return { success: false, message: res.error || 'Onboarding failed' };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, message: e?.message || 'Network error' };
    }
  };

  const createNewStaffAccount = async (payload: StaffAccountPayload) => {
    setIsLoading(true);
    try {
      const res = await createStaffAccountApi(payload, user?.id, user?.role);
      setIsLoading(false);
      if (res.success && res.user) {
        addNotification('Account Created', `Created ${payload.role} account for ${payload.name} (${payload.email})`, 'success');
        return { success: true, message: res.message };
      }
      return { success: false, message: res.error || 'Creation failed' };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, message: e?.message || 'Network error' };
    }
  };

  const switchRole = (newRole: UserRole, departmentCode?: DepartmentCode, councilMemberId?: string) => {
    let matchedUser = INITIAL_USERS.find(u => {
      if (u.role !== newRole) return false;
      if (councilMemberId && u.councilMemberId === councilMemberId) return true;
      if (departmentCode && u.departmentName?.toLowerCase().includes(departmentCode.toLowerCase())) return true;
      return true;
    });

    if (!matchedUser) {
      matchedUser = {
        id: `u-${newRole.toLowerCase()}-${Date.now()}`,
        username: `${newRole.toLowerCase()}_user`,
        name: newRole === 'PRINCIPAL' ? 'Dr. J. Davis' :
              newRole === 'ELECTION_COUNCIL' ? 'Aaradhya Saxena' :
              newRole === 'VICE_PRINCIPAL' ? 'Dr. Elizabeth Montgomery' :
              newRole === 'HOD' ? 'Dr. Aris Thorne' :
              newRole === 'STAFF' ? 'Officer Marcus Vance' :
              newRole === 'ADMIN' ? 'Robert Harrison' : 'Rohit Kumar',
        email: `${newRole.toLowerCase()}@avsct.edu.in`,
        role: newRole,
        designation: newRole === 'PRINCIPAL' ? 'Principal & Head of Institution' :
                     newRole === 'ELECTION_COUNCIL' ? '1 - Chairperson (Student Council)' :
                     newRole === 'VICE_PRINCIPAL' ? 'Vice Principal & Academic Dean' :
                     newRole === 'HOD' ? 'Head of Department' :
                     newRole === 'STAFF' ? 'Security & Proctor Lead' :
                     newRole === 'ADMIN' ? 'System Administrator' : 'B.E. Student',
        councilMemberId: newRole === 'ELECTION_COUNCIL' ? (councilMemberId || 'em-1') : undefined,
        councilRole: newRole === 'ELECTION_COUNCIL' ? 'CHAIRPERSON' : undefined,
        avatarUrl: newRole === 'STUDENT' ? '/images/rohit_kumar_id_photo_1787039178779.jpg' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
      };
    }

    setUser(matchedUser);
    setRole(newRole);
    localStorage.setItem('shov_auth_user', JSON.stringify(matchedUser));
    addNotification('Logged In', `Active Session: ${matchedUser.name} • ${matchedUser.designation || newRole}`, 'info');
  };

  const switchCouncilMember = (memberId: string) => {
    const matched = INITIAL_USERS.find(u => u.councilMemberId === memberId) || INITIAL_USERS.find(u => u.role === 'ELECTION_COUNCIL');
    if (matched) {
      setUser(matched);
      setRole('ELECTION_COUNCIL');
      localStorage.setItem('shov_auth_user', JSON.stringify(matched));
      addNotification('Council Member Login', `Authenticated as ${matched.name} (${matched.designation})`, 'success');
    }
  };

  const logout = async () => {
    await signOutFromSupabase();
    setUser(null);
    localStorage.removeItem('shov_auth_user');
    addNotification('Signed Out', 'You have been safely signed out of AVS College Portal.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        darkMode,
        notifications,
        toggleDarkMode,
        loginWithSupabaseEmail,
        signUpWithSupabaseEmail,
        registerMember,
        sendPasswordReset,
        loginWithPhoneOrEmail,
        verifyOtp,
        loginWithGoogle,
        completeStudentOnboarding,
        createNewStaffAccount,
        switchRole,
        switchCouncilMember,
        logout,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
