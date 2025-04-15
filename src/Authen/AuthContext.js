import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
	const storedToken = localStorage.getItem('token');
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

  return (
    <AuthContext.Provider value={{ user, token, loading, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
