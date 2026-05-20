export type Env = "HOM" | "DEV" | "PROD";

export interface Tenant {
  env: Env;
  token: string;
  tenantId: string;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
}
