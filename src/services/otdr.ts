import type { TenantParams } from "../types/Tenant";
import type { ApiResult } from "../types/Common";
import type { Env } from "../types/Tenant";
import { getUrls } from "./url";

export type OtdrParams = {
  env: Env;
  token: string;
  tenantId: string;
  projectId: string | null;
  projectName: string | null;
  otdrId: string;
  otdrName: string;
  severityName: string;
  severityCode: number;
  distance: string;
  eventName: string;
  eventCode: number;
  port: string;
  serialNumber: string;
  formattedDesc: string;
};

type OtdrReponse = Array<{
  id: string;
  name: string;
  serial_number: string;
}>;

export async function getOtdrsFromProject({
  env,
  token,
  tenantId,
  projectId,
}: TenantParams): Promise<ApiResult<OtdrReponse>> {
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
    return { success: false, message: `${response.status}: ${text}` };
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
      .filter((item: any) => item?.network_server === "SNMP")
      .map((item: any) => ({
        id: item.id,
        name: item.name || item.description || "OTDR Sem Nome",
        serial_number: item.serial_number || item.serialNumber || "",
        identificator_in_network:
          item.identificator_in_network || item.network_identificator || "",
      })),
  };
}

export async function sendOtdrAlarm({
  env,
  token,
  tenantId,
  projectId,
  projectName,
  otdrName,
  otdrId,
  severityName,
  severityCode,
  distance,
  eventName,
  eventCode,
  port,
  serialNumber,
  formattedDesc,
}: OtdrParams): Promise<ApiResult<{}>> {
  const urls = getUrls(env);
  const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

  const message = {
    tenant_id: tenantId,
    project_id: projectId,
    project_name: projectName,
    otdr_name: otdrName,
    otdr_id: otdrId,
    payload: {
      request_id: "",
      error_index: 0,
      error_status: 0,
      source_ip: "127.0.0.1:5000",
      varbinds: [
        {
          name: "1.3.6.1.6.3.1.1.4.1.0",
          type: "ObjectIdentifier",
          value: "1.3.6.1.4.1.35873.5.1.2.1.2.1",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.2",
          type: "OctetString",
          value: String(serialNumber),
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.3",
          type: "OctetString",
          value: `RTU : ${otdrName} (127.0.0.1)\n\tAlarm type: OPTICAL\n\tTimestamp: ${new Date().toLocaleString("pt-BR")}\n\tSeverity: ${severityName.toUpperCase()}\n\tLink name: Link 1 - Port 1\n\tProbable cause: ${eventName}\n\tOptical distance: ${distance}KM`,
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.5",
          type: "Integer",
          value: "1",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.4",
          type: "OctetString",
          value: `port=${String(port)}`,
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.6",
          type: "Integer",
          value: "1",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.7",
          type: "Integer",
          value: String(severityCode),
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.8",
          type: "OctetString",
          value: "\u0007\ufffd\u0003\u0005\n,\r\0",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.9",
          type: "OctetString",
          value: formattedDesc,
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.1",
          type: "OctetString",
          value: "Link 1",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.2",
          type: "Integer",
          value: String(eventCode),
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.3",
          type: "OctetString",
          value: "",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.4",
          type: "OctetString",
          value: distance,
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.5",
          type: "OctetString",
          value: "",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.6",
          type: "OctetString",
          value: eventName,
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.1",
          type: "OctetString",
          value: "",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.2",
          type: "OctetString",
          value: "",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.3",
          type: "OctetString",
          value: "",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.4",
          type: "OctetString",
          value: "",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.5",
          type: "OctetString",
          value: "",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.6",
          type: "OctetString",
          value: "",
        },
        {
          name: "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.7",
          type: "OctetString",
          value: "",
        },
      ],
    },
  };

  const response = await fetch(`${urls.OTDR_ALARM}/api/otdr-alarms`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Message: JSON.stringify(message) }),
  });

  const text = await response.text();

  if (!response.ok) {
    return {
      success: false,
      message: `${response.status}: ${text}`,
    };
  }

  return {
    success: true,
    message: text,
  };
}
