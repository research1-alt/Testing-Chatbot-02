
import { useState, useEffect, useCallback, useRef } from 'react';
import { hashPassword } from '../utils/crypto';
import { logInternRegistration, syncSessionToCloud, fetchRemoteSessionId, fetchUserFromCloud } from '../services/otpService';

const STORAGE_VERSION = 'OSM_REL_2025_V7_STRICT_SYNC';

export type User = {
  name: string;
  email: string;
  sessionId: string;
  mobile?: string;
  registeredAt?: string;
  password?: string; 
};

export type AuthCredentials = {
  name?: string;
  email: string;
  mobile?: string;
  password?: string;
};

export type LoginResult = {
  success: boolean;
  mfaRequired?: boolean;
  error?: string;
  tempUser?: any;
};

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'intro' | 'auth' | 'chat'>('intro');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCheckingRef = useRef(false);
  
  const ADMIN_EMAIL = 'research1@omegaseikimobility.com';
  const ADMIN_HASH = '3970b54203666f884a4411130e9d6b2c2560e9063d83811801267b1860882736';

  const logout = useCallback((reason?: string) => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    localStorage.removeItem('currentUser');
    setUser(null);
    setView('auth');
    if (reason) {
        setTimeout(() => alert(reason), 100);
    }
  }, []);

  const validateSessionCloud = useCallback(async (email: string, localId: string) => {
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return;
    if (isCheckingRef.current) return;
    
    isCheckingRef.current = true;
    try {
        const remoteId = await fetchRemoteSessionId(email);
        if (remoteId && remoteId !== localId && remoteId !== 'NOT_FOUND') {
          logout("⚠️ SESSION TERMINATED: You have logged in on another device. Only one device can be active at a time.");
        }
    } catch (e) {
        // Network hiccup, do not logout
    } finally {
        isCheckingRef.current = false;
    }
  }, [logout, ADMIN_EMAIL]);

  useEffect(() => {
    const currentStoredVersion = localStorage.getItem('osm_app_version');
    if (currentStoredVersion !== STORAGE_VERSION) {
      const users = localStorage.getItem('users');
      localStorage.clear(); 
      if (users) localStorage.setItem('users', users); // Preserve registry
      localStorage.setItem('osm_app_version', STORAGE_VERSION);
      setUser(null);
      setView('intro');
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) return;

      try {
        const currentUser = JSON.parse(currentUserStr);
        setUser(currentUser);
        setView('chat');

        await validateSessionCloud(currentUser.email, currentUser.sessionId);

        if (!checkIntervalRef.current) {
          checkIntervalRef.current = setInterval(() => {
            validateSessionCloud(currentUser.email, currentUser.sessionId);
          }, 5000);
        }
      } catch (e) {
        console.error("Auth restore error", e);
      }
    };

    initializeAuth();

    const handleFocus = () => {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            const parsed = JSON.parse(currentUserStr);
            validateSessionCloud(parsed.email, parsed.sessionId);
        }
    };

    window.addEventListener('focus', handleFocus);
    return () => { 
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        window.removeEventListener('focus', handleFocus);
    };
  }, [logout, validateSessionCloud]);

  const finalizeLogin = useCallback(async (userData: any) => {
    const newSessionId = "SID_" + Date.now() + "_" + Math.random().toString(36).substring(2, 12);
    const lowerEmail = userData.email.toLowerCase().trim();
    
    const userToAuth: User = { 
        name: userData.name || userData.userName, 
        email: lowerEmail,
        mobile: userData.mobile,
        sessionId: newSessionId 
    };

    if (lowerEmail !== ADMIN_EMAIL.toLowerCase()) {
      await syncSessionToCloud(lowerEmail, newSessionId, userToAuth.name, userToAuth.mobile);
    }

    localStorage.setItem('currentUser', JSON.stringify(userToAuth));
    setUser(userToAuth);
    setView('chat');
  }, [ADMIN_EMAIL]);

  const login = useCallback(async (credentials: AuthCredentials): Promise<LoginResult> => {
    setIsAuthLoading(true);
    setAuthError(null);
    
    try {
        const { email, password } = credentials;
        const hashedPassword = await hashPassword(password || '');
        const lowerEmail = email.toLowerCase().trim();
        
        // Admin check
        if (lowerEmail === ADMIN_EMAIL.toLowerCase() && hashedPassword === ADMIN_HASH) {
            return { success: true, tempUser: { name: 'Admin', email: ADMIN_EMAIL } };
        }

        // 1. Check Cloud Registry (Primary Source)
        const cloudUser = await fetchUserFromCloud(lowerEmail);
        if (cloudUser && cloudUser.password === hashedPassword) {
            return { success: true, tempUser: cloudUser };
        }

        // 2. Fallback: Check Local Registry (For immediate login after signup)
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const localMatch = localUsers.find((u: any) => u.email.toLowerCase().trim() === lowerEmail);
        
        if (localMatch && localMatch.password === hashedPassword) {
            return { success: true, tempUser: localMatch };
        }

        return { success: false, error: 'Identity check failed. Please check your email and password.' };
    } catch (e) {
        return { success: false, error: "Authentication system error. Please try again." };
    } finally {
        setIsAuthLoading(false);
    }
  }, [ADMIN_HASH, ADMIN_EMAIL]);

  const checkEmailExists = useCallback((email: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim()) || null;
  }, []);

  const signup = useCallback(async (credentials: AuthCredentials) => {
    setIsAuthLoading(true);
    try {
        const lowerEmail = credentials.email.toLowerCase().trim();
        const cloudCheck = await fetchUserFromCloud(lowerEmail);
        if (cloudCheck) {
            setAuthError('This email is already registered.');
            return false;
        }
        return true; 
    } catch (e) { return false; } 
    finally { setIsAuthLoading(false); }
  }, []);

  const commitSignup = useCallback(async (credentials: AuthCredentials) => {
    try {
        const lowerEmail = credentials.email.toLowerCase().trim();
        const hashedPassword = await hashPassword(credentials.password || '');
        const newUser = { 
            userName: credentials.name, 
            email: lowerEmail, 
            mobile: credentials.mobile, 
            password: hashedPassword 
        };
        
        // Push to cloud
        await logInternRegistration({
            email: newUser.email,
            mobile: newUser.mobile || '',
            userName: newUser.userName || '',
            password: hashedPassword,
            emailCode: 'REG_NEW'
        });

        // Push to local storage immediately
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const existingIdx = localUsers.findIndex((u: any) => u.email.toLowerCase().trim() === lowerEmail);
        if (existingIdx >= 0) {
            localUsers[existingIdx] = newUser;
        } else {
            localUsers.push(newUser);
        }
        localStorage.setItem('users', JSON.stringify(localUsers));

        return true;
    } catch (e) { return false; }
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string): Promise<boolean> => {
    try {
        const lowerEmail = email.toLowerCase().trim();
        const hashedPassword = await hashPassword(newPassword);
        
        await logInternRegistration({
            email: lowerEmail,
            mobile: 'RECOVERY',
            userName: 'RECOVERY',
            password: hashedPassword,
            emailCode: 'RESET_PWD'
        });

        // Also update locally to allow instant login
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = localUsers.findIndex((u: any) => u.email.toLowerCase().trim() === lowerEmail);
        if (idx >= 0) {
            localUsers[idx].password = hashedPassword;
            localStorage.setItem('users', JSON.stringify(localUsers));
        }

        return true;
    } catch (e) { return false; }
  }, []);

  const getAllInterns = useCallback(() => JSON.parse(localStorage.getItem('users') || '[]') as User[], []);
  const deleteIntern = useCallback((email: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]').filter((u: any) => u.email !== email);
    localStorage.setItem('users', JSON.stringify(users));
  }, []);

  return { 
    user, view, setView, login, finalizeLogin, signup, commitSignup, 
    logout, authError, isAuthLoading, getAllInterns, deleteIntern,
    checkEmailExists, resetPassword
  };
};

export default useAuth;
