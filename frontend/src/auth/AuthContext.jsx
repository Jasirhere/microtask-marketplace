import { createContext, useContext, useEffect, useState } from "react";
import { getMyProfiles } from "../api/profile";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  async function loadUser() {
    try {
      const data = await getMyProfiles();
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem("access_token");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  function setToken(token) {
    localStorage.setItem("access_token", token);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        checking,
        setToken,
        logout,
        reload: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}