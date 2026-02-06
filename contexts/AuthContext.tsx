import { userType } from "@/types/Auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  user: userType | null;
  loginUser: (credentials: { email: string; password: string }) => Promise<void>;
  logoutUser: () => Promise<void>;
};

type UserContextProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;

export function AuthProvider({ children }: UserContextProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<userType | null>(null);

  const url = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken) setToken(JSON.parse(storedToken));
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to load auth data:', err);
      }
    };

    loadAuthData();
  }, []);

  const loginUser = async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await fetch(url + '/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login Failed');
      }

      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);

        await AsyncStorage.setItem('token', JSON.stringify(data.token));
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      throw err;
    }
  };

  const logoutUser = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
