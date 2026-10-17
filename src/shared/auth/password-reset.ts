import { apiRequest } from "../api/client";

const PENDING_PASSWORD_RESET_KEY = "elmourdy-pending-password-reset";

export type PendingPasswordReset = {
  email?: string;
  passwordResetId: number;
  expiresAt: string;
  resendAfterSeconds: number;
  verificationMethod: "email_code";
  clientToken: string;
  requestedAt?: number;
};

type PasswordResetResponse = {
  password_reset_id: number;
  expires_at: string;
  resend_after_seconds: number;
  verification_method: "email_code";
  client_token: string;
};

export function storePendingPasswordReset(reset: PendingPasswordReset) {
  try {
    sessionStorage.setItem(PENDING_PASSWORD_RESET_KEY, JSON.stringify(reset));
  } catch {
    // The reset remains usable in memory when browser storage is disabled.
  }
}

export function loadPendingPasswordReset() {
  let value: string | null;
  try {
    value = sessionStorage.getItem(PENDING_PASSWORD_RESET_KEY);
  } catch {
    return null;
  }
  if (!value) return null;
  try {
    const reset = JSON.parse(value) as Partial<PendingPasswordReset>;
    if (Number.isSafeInteger(reset.passwordResetId) && reset.passwordResetId! > 0 &&
      typeof reset.clientToken === "string" && reset.clientToken.length > 0 &&
      typeof reset.expiresAt === "string" && Number.isFinite(Date.parse(reset.expiresAt)) &&
      typeof reset.resendAfterSeconds === "number" && reset.verificationMethod === "email_code") {
      return reset as PendingPasswordReset;
    }
  } catch {
    // A partially written browser-storage value must not crash recovery.
  }
  clearPendingPasswordReset();
  return null;
}

export function clearPendingPasswordReset() {
  try {
    sessionStorage.removeItem(PENDING_PASSWORD_RESET_KEY);
  } catch {
    // Storage may be unavailable in private browsing mode.
  }
}

export async function requestPasswordReset(email: string) {
  const response = await apiRequest<PasswordResetResponse>("/password_resets", {
    method: "POST",
    body: JSON.stringify({ password_reset: { email } }),
  });
  return {
    email,
    passwordResetId: response.password_reset_id,
    expiresAt: response.expires_at,
    resendAfterSeconds: response.resend_after_seconds,
    verificationMethod: response.verification_method,
    clientToken: response.client_token,
    requestedAt: Date.now(),
  } satisfies PendingPasswordReset;
}

export function verifyPasswordReset(reset: PendingPasswordReset, code: string) {
  return apiRequest<{ status: "verified"; expires_at: string }>(
    `/password_resets/${reset.passwordResetId}/verify`,
    {
      method: "POST",
      body: JSON.stringify({
        password_reset: { client_token: reset.clientToken, code },
      }),
    },
  );
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
