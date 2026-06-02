import { createContext, useContext, useState } from "react";
import type { Env } from "../types/Tenant";
import type { ProjectResponse } from "../services/projects";

type AppContextType = {
  env: Env;
  token: string | null;
  tenantId: string | null;
  projectId: string | null;
  projectName: string | null;
  setEnv: (env: Env) => void;
  setToken: (token: string | null) => void;
  setTenantId: (tenantId: string | null) => void;
  setProject: (project: ProjectResponse) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [env, setEnv] = useState<Env>("HOM");
  const [token, setToken] = useState<string | null>("");
  const [tenantId, setTenantId] = useState<string | null>("");
  const [project, setProject] = useState<ProjectResponse>({
    id: null,
    name: null,
  });

  return (
    <AppContext.Provider
      value={{
        env,
        token,
        tenantId,
        projectId: project.id,
        projectName: project.name,
        setEnv,
        setToken,
        setTenantId,
        setProject,
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
