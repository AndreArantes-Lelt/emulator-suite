import type { Tenant } from "../types/Tenant";
import type { ApiResult } from "../types/Utils";
import type { Env } from "../types/Tenant";
import { getUrls } from "./url";

type Sensor = Array<{ id: string; name: string; type: "REDE" | "UUID" }>;

export async function getSensorsFromProject({
  env,
  token,
  tenantId,
  projectId,
}: Tenant): Promise<ApiResult<Sensor>> {
  const urls = getUrls(env);
  const response = await fetch(
    `${urls.SENSOR_ALARM}/companies/${tenantId}/${projectId}/devices?limit=100`,
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
  let items: any[] = [];

  if (Array.isArray(body)) items = body;
  else if (body.items) items = body.items;
  else if (body.devices) items = body.devices;
  else if (body.data) items = body.data;

  return {
    success: true,
    data: items
      .map((item: any) => {
        const redeId =
          item.identificator_in_network ||
          item.dev_eui ||
          item.network_identificator;
        const name = item.description || item.name || "Sem Nome";

        if (redeId) return { id: redeId, name, type: "REDE" as const };
        if (item.id) return { id: item.id, name, type: "UUID" as const };
        return null;
      })
      .filter(Boolean) as Array<{
      id: string;
      name: string;
      type: "REDE" | "UUID";
    }>,
  };
}

export async function sendSensorAlarm(
  env: Env,
  token: string,
  tenantId: string,
  devEui: string,
  cause: string,
): Promise<ApiResult<{ status: number }>> {
  const urls = getUrls(env);
  const url = `${urls.SENSOR_ALARM}/companies/${tenantId}/uplink_emulator/${encodeURIComponent(
    devEui.trim(),
  )}?payload_type=${encodeURIComponent(cause)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: token,
      "Accept-Encoding": "gzip, deflate, br",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    return {
      success: false,
      message: `${response.status}: ${text}`,
    };
  }

  return {
    success: true,
  };
}
