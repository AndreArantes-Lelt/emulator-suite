import type { Env } from "./Url";

export interface Tenant {
  env: Env;
  tenantId: string;
  token: string;
}
