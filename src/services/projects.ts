import type { TenantParams } from "../types/Tenant";
import type { ApiResult } from "../types/Utils";
import { getUrls } from "./url";

type ProjectResponse = {
  id: string;
  name: string;
};

export async function getProjects({
  env,
  token,
  tenantId,
}: TenantParams): Promise<ApiResult<ProjectResponse[]>> {
  try {
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
      return {
        success: false,
        data: [],
        message: `${response.status}: ${text}`,
      };
    }

    const body = await response.json();
    const data = body.data;

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      message: "sua conta não tem acesso ao tenant ou ele não existe",
    };
  }
}
