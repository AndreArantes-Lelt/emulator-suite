import type { Tenant } from "../types/Tenant";
import type { Project } from "../types/Tenant";
import type { ApiResult } from "../types/Utils";
import { getUrls } from "./url";

function extractProjects(body: object): Project[] {
  if (Array.isArray(body)) return body;

  const obj = body as Record<string, unknown>;
  const candidates = [obj.project, obj.data, obj.projects, obj.items];

  const list = candidates.find(Array.isArray);
  if (Array.isArray(list)) return list as Project[];

  return [];
}

export async function getProjects({
  env,
  token,
  tenantId,
}: Tenant): Promise<ApiResult<Project[]>> {
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
    const text = await response.text();
    return { success: false, data: [], message: `${response.status}: ${text}` };
  }

  const body = await response.json();
  const data = extractProjects(body);

  return {
    success: true,
    data,
  };
}
