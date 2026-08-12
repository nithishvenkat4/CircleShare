import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);
const TOKEN_KEY = 'circleshare_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, res.data.data.token);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    localStorage.setItem(TOKEN_KEY, res.data.data.token);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
