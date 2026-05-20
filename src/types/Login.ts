import type { Env } from "./Tenant";

export interface Login {
  env: Env;
  username: string;
  password: string;
}
