export type ApiResult<T> = { success: boolean; data?: T; message?: string };

export type UrlOptions = {
  AUTH_PROJ: string;
  SENSOR_ALARM: string;
  WEBHOOK_ONU: string;
  ONU_SEARCH_BASE: string;
  OTDR_LIST: string;
  OTDR_ALARM_BASE: string;
};
