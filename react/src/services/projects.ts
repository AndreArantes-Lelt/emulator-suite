import type { Tenant } from "../types/Api";
import { getUrls } from "./url";

export async function getProjects({
  env,
  tenantId,
  token,
}: Tenant): Promise<any[]> {
  const urls = getUrls(env);
  const response = await fetch(
    `${urls.AUTH_PROJ}/companies/${tenantId}/projects?limit=50`,
    {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Erro Projetos (${response.status})`);
  }

  const data = await response.json();
  if (Array.isArray(data)) return data;
  return data.items ?? data.projects ?? data.data ?? [];
}
