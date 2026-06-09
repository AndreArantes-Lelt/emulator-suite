export type ApiResult<T> = { success: boolean; data?: T; message?: string };

export type Options<T> = { label: string; value: T };

export type Map<T> = {
  name: T;
  code: number;
};
