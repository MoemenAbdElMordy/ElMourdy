import { apiRequest } from "../api/client";

const PENDING_PASSWORD_RESET_KEY = "elmourdy-pending-password-reset";

export type PendingPasswordReset = {
  passwordResetId: number;
  expiresAt: string;
  resendAfterSeconds: number;
  verificationMethod: "whatsapp_inbound";
  whatsappUrl: string;
  clientToken: string;
};

type PasswordResetResponse = {
  password_reset_id: number;
  expires_at: string;
  resend_after_seconds: number;
  verification_method: "whatsapp_inbound";
  whatsapp_url: string;
  client_token: string;
};

export function storePendingPasswordReset(reset: PendingPasswordReset) {
  sessionStorage.setItem(PENDING_PASSWORD_RESET_KEY, JSON.stringify(reset));
}

export function loadPendingPasswordReset() {
  const value = sessionStorage.getItem(PENDING_PASSWORD_RESET_KEY);
  return value ? JSON.parse(value) as PendingPasswordReset : null;
}

export function clearPendingPasswordReset() {
  sessionStorage.removeItem(PENDING_PASSWORD_RESET_KEY);
}

export async function requestPasswordReset(phone: string) {
  const response = await apiRequest<PasswordResetResponse>("/password_resets", {
    method: "POST",
    body: JSON.stringify({ password_reset: { phone } }),
  });
  return {
    passwordResetId: response.password_reset_id,
    expiresAt: response.expires_at,
    resendAfterSeconds: response.resend_after_seconds,
    verificationMethod: response.verification_method,
    whatsappUrl: response.whatsapp_url,
    clientToken: response.client_token,
  } satisfies PendingPasswordReset;
}

export function loadPasswordResetStatus(reset: PendingPasswordReset) {
  return apiRequest<{ status: "pending" | "verified" | "expired" | "failed" | "consumed"; expires_at: string }>(
    `/password_resets/${reset.passwordResetId}/status`,
    {
      method: "POST",
      body: JSON.stringify({ password_reset: { client_token: reset.clientToken } }),
    },
  );
}

export function completePasswordReset(
  reset: PendingPasswordReset,
  password: string,
  passwordConfirmation: string,
) {
  return apiRequest<void>(`/password_resets/${reset.passwordResetId}`, {
    method: "PATCH",
    body: JSON.stringify({
      password_reset: {
        client_token: reset.clientToken,
        password,
        password_confirmation: passwordConfirmation,
      },
    }),
  });
}
