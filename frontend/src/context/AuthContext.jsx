import { createContext, useEffect, useState } from "react";
import { getUser, getToken, logout } from "../utils/auth";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
  };

  const signOut = () => {
    logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signOut,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export { AuthProvider, AuthContext };