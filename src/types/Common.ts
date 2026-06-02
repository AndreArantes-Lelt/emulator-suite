export type ApiResult<T> = { success: boolean; data?: T; message?: string };

export type Options<T> = { label: string; value: T };

export type Map<T> = {
  name: T;
  code: number;
};

export interface UrlOptions {
  AUTH_PROJ: string;
  SENSOR_ALARM: string;
  OTDR_LIST: string;
  OTDR_ALARM_BASE: string;
}
