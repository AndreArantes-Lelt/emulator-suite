import { createContext, useContext, useState, useEffect } from "react";

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("authToken");
  });

  useEffect(() => {
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
