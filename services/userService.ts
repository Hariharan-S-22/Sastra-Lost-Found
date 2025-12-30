
import { User } from '../types';

const STORAGE_KEY = 'sastra_users_db';

const getLocalUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const setLocalUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const userService = {
  async getUser(email: string): Promise<User | null> {
    const users = getLocalUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async saveUser(user: User): Promise<User> {
    const users = getLocalUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    
    setLocalUsers(users);
    return user;
  },

  async getAllUsers(): Promise<User[]> {
    return getLocalUsers();
  },

  async deleteUser(userId: string): Promise<void> {
    const users = getLocalUsers();
    const filtered = users.filter(u => u.id !== userId);
    setLocalUsers(filtered);
  },

  // Dummy methods to maintain compatibility with existing components
  isCloudConnected: () => true,
  isDatabaseActive: () => true,
  getLastError: () => null
};

export async function checkBackendHealth() {
  return { available: true, db: true, error: null };
}

export async function fetchWithFallback(resource: string, options: RequestInit = {}) {
  // Not used in local-only mode but kept for type safety if imported elsewhere
  return new Response();
}
