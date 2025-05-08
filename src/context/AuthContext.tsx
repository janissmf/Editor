import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (credential: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<{ userId: string }>(token);
      if (decoded.userId) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.get(`${import.meta.env.VITE_API_URL}/auth/user`)
          .then(response => {
            setUser(response.data.user);
          })
          .catch(() => {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          });
      }
    }
  }, []);

  const signIn = async (credential: string) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        credential,
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.user.email);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};