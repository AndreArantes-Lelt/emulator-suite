import type { Env } from "../types/Tenant";
import type { UrlOptions } from "../types/Url";

const getEnvVar = (key: string): string | undefined => {
  const env = (import.meta as any).env ?? {};
  const raw = env[key] ?? undefined;

  if (typeof raw !== "string") return undefined;
  return raw.replace(/^"(.*)"$/, "$1").trim();
};

const buildUrlSet = (env: Env): UrlOptions => {
  const make = (k: keyof UrlOptions) => {
    const val = getEnvVar(`VITE_${env}_${k}`);
    if (!val) throw new Error(`Missing env var VITE_${env}_${k}`);
    return val;
  };

  return {
    AUTH_PROJ: make("AUTH_PROJ"),
    SENSOR_ALARM: make("SENSOR_ALARM"),
    OTDR_ALARM: make("OTDR_ALARM"),
  };
};

export const getUrls = (env: Env): UrlOptions => buildUrlSet(env);
