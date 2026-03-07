import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/appconf';

interface User {
  id: string;
  name: string;
  email: string;
  photoProfile: string;
  photoPublicId: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  hasNewForumPosts: boolean;
  setHasNewForumPosts: (val: boolean) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNewForumPosts, setHasNewForumPosts] = useState(false);

  const checkForNewPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/forum/posts?category=All`, {
        headers: { 'ngrok-skip-browser-warning': 'true', 'Accept': 'application/json' }
      });
      const data = await response.json();

      if (data.success && data.posts.length > 0) {
        const latestPostId = data.posts[0]._id;
        const lastSeenId = await AsyncStorage.getItem('last_seen_post_id');

        if (!lastSeenId) {
          await AsyncStorage.setItem('last_seen_post_id', latestPostId);
        } else if (lastSeenId !== latestPostId) {
          setHasNewForumPosts(true);
        }
      }
    } catch (error) {
      console.error('[Poller] Error checking for posts:', error);
    }
  };
  

  useEffect(() => {
    const interval = setInterval(() => {
      checkForNewPosts();
    }, 30000); // 30 seconds interval
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    try {
      const keys = ['user_id', 'name', 'email', 'photoProfile', 'photoPublicId', 'user_role'];
      const stores = await AsyncStorage.multiGet(keys);
      
      // Convert array of pairs to an object
      const data: any = {};
      stores.forEach(([key, value]) => {
        data[key] = value;
      });

      if (data.user_id) {
        setUser({
          id: data.user_id,
          name: data.name || '',
          email: data.email || '',
          photoProfile: data.photoProfile || '',
          photoPublicId: data.photoPublicId || '',
          role: data.user_role || 'user',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    await loadUser();
  };

  const logout = async () => {
    console.log('[UserContext] Logging out...');
    try {
      await AsyncStorage.multiRemove([
        'jwt_token',
        'user_id',
        'name',
        'email',
        'photoProfile',
        'photoPublicId',
        'user_role'
      ]);
      setUser(null);
      console.log('[UserContext] Logout complete, state reset.');
    } catch (error) {
      console.error('[UserContext] Logout error:', error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        hasNewForumPosts, 
        setHasNewForumPosts,
        refreshUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

