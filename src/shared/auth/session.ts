import { apiRequest, clearSessionToken, getSessionToken, setSessionToken } from "../api/client";

export type AuthRole = "student" | "parent" | "teacher" | "assistant";

export type AuthUser = {
  id: number;
  name: string;
  phone: string;
  role: AuthRole;
};

type SessionResponse = {
  token: string;
  user: AuthUser;
};

function deviceFingerprint() {
  const key = "elmourdy-device-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const value = crypto.randomUUID();
  localStorage.setItem(key, value);
  return value;
}

export async function login(phone: string, password: string) {
  const response = await apiRequest<SessionResponse>("/session", {
    method: "POST",
    body: JSON.stringify({
      session: {
        phone,
        password,
        device_fingerprint: deviceFingerprint(),
        browser: navigator.userAgent,
      },
    }),
  });
  setSessionToken(response.token);
  return response.user;
}

export async function restoreSession() {
  if (!getSessionToken()) return null;

  try {
    const response = await apiRequest<{ user: AuthUser }>("/session");
    return response.user;
  } catch {
    clearSessionToken();
    return null;
  }
}

export async function logout() {
  try {
    if (getSessionToken()) await apiRequest<void>("/session", { method: "DELETE" });
  } finally {
    clearSessionToken();
  }
}
