import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasNotification, setHasNotification] = useState(false);
  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (isExpired(storedToken)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token', token);
      setLoading(false);
      return;
    }
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);
  // Update both state and localStorage
  // Of both user info and access token
  const setAuth = (user, token) => {
    setUserState(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token', token);
    }
  };

  const isExpired = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000; // current time in seconds
      return decoded.exp < now;
    } catch (err) {
      // token is invalid or can't be decoded
      return true;
    }
  };

  const isTokenExpired = () => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000; // current time in seconds
      return decoded.exp < now;
    } catch (err) {
      // token is invalid or can't be decoded
      return true;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setAuth, isTokenExpired, hasNotification, setHasNotification, }}>
      {children}
    </AuthContext.Provider>
  );
};
