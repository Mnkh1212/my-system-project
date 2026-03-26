import { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const stored = localStorage.getItem('authData');
  const initial = stored ? JSON.parse(stored) : null;

  const [user, setUser] = useState(initial);

  const login = (token, email) => {
    const data = { token, email };
    localStorage.setItem('authData', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('authData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
