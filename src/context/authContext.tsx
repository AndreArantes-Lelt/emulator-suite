import { createContext, useContext, useState, useEffect } from "react";
import type { Env } from "../types/Url";

type AuthState = {
  env: Env;
  setEnv: (env: Env | "HOM") => void;
  token: string | null;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [env, setEnv] = useState<Env>(() => {
    return localStorage.getItem("authEnv") as Env | "HOM";
  });

  useEffect(() => {
    if (env) localStorage.setItem("authEnv", env);
    else localStorage.removeItem("authEnv");
  }, [env]);

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("authToken");
  });

  useEffect(() => {
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");
  }, [token]);

  return (
    <AuthContext.Provider value={{ env, setEnv, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
