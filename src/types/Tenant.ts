export type Env = "HOM" | "DEV" | "PROD";

export interface TenantParams {
  env: Env;
  token: string;
  tenantId: string;
  projectId?: string;
}
