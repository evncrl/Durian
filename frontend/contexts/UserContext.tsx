import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const loadUser = async () => {
    try {
      const storedId = await AsyncStorage.getItem('user_id');
      const storedName = await AsyncStorage.getItem('name');
      const storedEmail = await AsyncStorage.getItem('email');
      const storedPhoto = await AsyncStorage.getItem('photoProfile');
      const storedPublicId = await AsyncStorage.getItem('photoPublicId');
      const storedRole = await AsyncStorage.getItem('user_role');

      console.log('[UserContext] Loaded from AsyncStorage:', {
        storedId,
        storedName,
        storedEmail,
        storedPhoto,
        storedPublicId,
        storedRole,
      });

      if (storedId) {
        setUser({
          id: storedId,
          name: storedName || '',
          email: storedEmail || '',
          photoProfile: storedPhoto || '',
          photoPublicId: storedPublicId || '',
          role: storedRole || 'user',
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

