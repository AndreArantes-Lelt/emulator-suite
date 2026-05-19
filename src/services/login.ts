import type { Login } from "../types/Login";
import { getUrls } from "./url";

type ApiResult<T> = { success: boolean; data?: T; message?: string };

export async function performLogin({
  env,
  username,
  password,
}: Login): Promise<ApiResult<{ token: string }>> {
  const urls = getUrls(env);
  const urlAuth = `${urls.AUTH_PROJ}/auth/`;
  const response = await fetch(urlAuth, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const text = await response.text();
    return { success: false, message: `Erro ${response.status}: ${text}` };
  }

  const body = await response.json();
  const token = body.id_token;
  if (!token) {
    return { success: false, message: "Token não retornado" };
  }

  return { success: true, data: { token } };
}
