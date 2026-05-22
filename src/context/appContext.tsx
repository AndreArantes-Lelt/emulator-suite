import { createContext, useContext, useState, useEffect } from "react";
import type { Env } from "../types/Tenant";

type AppContextType = {
  env: Env;
  token: string | null;
  tenantId: string | null;
  projectId: string | null;
  setEnv: (env: Env | "HOM") => void;
  setToken: (token: string | null) => void;
  setTenantId: (token: string | null) => void;
  setProjectId: (token: string | null) => void;
  clearSession: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [env, setEnv] = useState<Env>(() => {
    return localStorage.getItem("appEnv") as Env | "HOM";
  });

  useEffect(() => {
    if (env) localStorage.setItem("appEnv", env);
    else localStorage.removeItem("appEnv");
  }, [env]);

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("appToken");
  });

  useEffect(() => {
    if (token) localStorage.setItem("appToken", token);
    else localStorage.removeItem("appToken");
  }, [token]);

  const [tenantId, setTenantId] = useState<string | null>(() => {
    return localStorage.getItem("appTenantId");
  });

  useEffect(() => {
    if (tenantId) localStorage.setItem("appTenantId", tenantId);
    else localStorage.removeItem("appTenantId");
  }, [tenantId]);

  const [projectId, setProjectId] = useState<string | null>(() => {
    return localStorage.getItem("appProjectId");
  });

  useEffect(() => {
    if (projectId) localStorage.setItem("appProjectId", projectId);
    else localStorage.removeItem("appProjectId");
  }, [projectId]);

  const clearSession = () => {
    setEnv("HOM");
    setToken(null);
    setTenantId(null);
    setProjectId(null);
  };

  return (
    <AppContext.Provider
      value={{
        env,
        token,
        tenantId,
        projectId,
        setEnv,
        setToken,
        setTenantId,
        setProjectId,
        clearSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};
