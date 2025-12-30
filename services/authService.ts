
import { User } from '../types.ts';
import { auth, googleProvider } from './firebase.ts';
import { signInWithPopup, signOut } from 'firebase/auth';
import { userService } from './userService.ts';

const SESSION_KEY = 'sastra_lf_session';
const ADMIN_EMAIL = 'hariharan.s220507@gmail.com';

export const validateSastraEmail = (email: string | null): boolean => {
  if (!email) return false;
  const lowerEmail = email.toLowerCase();
  const sastraRegex = /^\d{9}@sastra\.ac\.in$/i;
  return (
    sastraRegex.test(lowerEmail) || 
    lowerEmail.endsWith('@sastra.ac.in') || 
    lowerEmail === ADMIN_EMAIL.toLowerCase()
  );
};

export const isAdmin = (email?: string): boolean => {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Logout Error:", e);
  }
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

export const signInWithGoogle = async (): Promise<User | { error: string }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;
    
    if (!googleUser || !googleUser.email || !validateSastraEmail(googleUser.email)) {
      await signOut(auth);
      return { error: 'Access Denied: Only SASTRA Institutional accounts are permitted.' };
    }

    const email = googleUser.email.toLowerCase();
    
    // SOURCE OF TRUTH: Check MongoDB
    const dbUser = await userService.getUser(email);

    if (dbUser && dbUser.onboarded) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(dbUser));
      return dbUser;
    }

    // New User or not onboarded
    const isGlobalAdmin = isAdmin(email);
    const regNo = isGlobalAdmin ? 'ADMIN' : (email.split('@')[0] || 'N/A');
    const displayName = googleUser.displayName || (isGlobalAdmin ? 'System Admin' : `Student ${regNo}`);
    const photo = googleUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1e3a8a&color=fff&size=256&bold=true`;

    const newUser: User = {
      id: btoa(email).replace(/[/+=]/g, ''),
      name: displayName,
      email: email,
      registrationNumber: regNo,
      profilePicture: photo,
      trustScore: 100,
      resolvedCount: 0,
      onboarded: false, 
      theme: 'light',
    };

    return newUser;
  } catch (error: any) {
    console.error("Auth Error:", error);
    return { error: error.message || 'Authentication failed.' };
  }
};

export const loginUser = async (user: User, onboardingData?: Partial<User>): Promise<User | null> => {
  const updatedUser: User = { 
    ...user, 
    ...onboardingData, 
    name: (onboardingData?.name || user.name).trim(),
    onboarded: true 
  };
  
  try {
    const savedUser = await userService.saveUser(updatedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(savedUser));
    return savedUser;
  } catch (e: any) {
    console.error("Onboarding Persistence Error:", e);
    throw e;
  }
};

export const updateUserTheme = async (theme: 'light' | 'dark') => {
  const user = getCurrentUser();
  if (user) {
    user.theme = theme;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    await userService.saveUser(user).catch(() => {});
  }
};

export const updateUserProfile = async (updatedData: Partial<User>): Promise<User | null> => {
  const user = getCurrentUser();
  if (user) {
    const updatedUser = { ...user, ...updatedData };
    try {
      const saved = await userService.saveUser(updatedUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(saved));
      return saved;
    } catch (e) {
      console.error("Profile update failed:", e);
      return null;
    }
  }
  return null;
};

export const getAllUsers = async (): Promise<User[]> => {
  return await userService.getAllUsers();
};

export const deleteUser = async (userId: string): Promise<void> => {
  return await userService.deleteUser(userId);
};
