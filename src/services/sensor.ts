import type { TenantParams } from "../types/Tenant";
import type { ApiResult } from "../types/Utils";
import type { Env } from "../types/Tenant";
import { getUrls } from "./url";

export type SensorParams = {
  env: Env;
  token: string;
  tenantId: string;
  devEui: string;
  cause: string;
};

type SensorsReponse = Array<{
  id: string;
  name: string;
  type: "REDE" | "UUID";
}>;

export async function getSensorsFromProject({
  env,
  token,
  tenantId,
  projectId,
}: TenantParams): Promise<ApiResult<SensorsReponse>> {
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

export async function sendSensorAlarm({
  env,
  token,
  tenantId,
  devEui,
  cause,
}: SensorParams): Promise<ApiResult<{}>> {
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
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}
