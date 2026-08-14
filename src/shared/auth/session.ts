import { apiRequest, clearSessionToken, getSessionToken, setSessionToken } from "../api/client";

export type AuthRole = "student" | "parent" | "teacher" | "assistant";

export type AuthUser = {
  id: number;
  name: string;
  phone: string;
  role: AuthRole;
  verified: boolean;
  permissions: string[];
};

type SessionResponse = {
  token: string;
  user: AuthUser;
};

export function deviceFingerprint() {
  const key = "elmourdy-device-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const value = crypto.randomUUID();
  localStorage.setItem(key, value);
  return value;
}

export function deviceMetadata() {
  const userAgent = navigator.userAgent;
  const os = userAgent.includes("Windows") ? "Windows" :
    userAgent.includes("Android") ? "Android" :
      /iPhone|iPad/.test(userAgent) ? "iOS" :
        userAgent.includes("Mac OS") ? "macOS" :
          userAgent.includes("Linux") ? "Linux" : "Unknown OS";
  const browser = userAgent.includes("Edg/") ? "Microsoft Edge" :
    userAgent.includes("Chrome/") ? "Google Chrome" :
      userAgent.includes("Firefox/") ? "Mozilla Firefox" :
        userAgent.includes("Safari/") ? "Safari" : "Unknown browser";

  return { device_name: `${os} device`, browser, os };
}

export function acceptSession(response: SessionResponse) {
  setSessionToken(response.token);
  return response.user;
}

export async function login(phone: string, password: string) {
  const response = await apiRequest<SessionResponse>("/session", {
    method: "POST",
    body: JSON.stringify({
      session: {
        phone,
        password,
        device_fingerprint: deviceFingerprint(),
        ...deviceMetadata(),
      },
    }),
  });
  return acceptSession(response);
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
