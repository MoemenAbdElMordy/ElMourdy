import { apiRequest } from "../api/client";
import type { AuthUser } from "./session";

export type AccountVerification = {
  verificationId: number;
  verificationMethod: "email" | "telegram";
  telegramAvailable: boolean;
  emailHint: string;
  expiresAt: string;
  resendAfterSeconds: number;
};

type VerificationResponse = {
  verification_id: number;
  verification_method: "email" | "telegram";
  telegram_available: boolean;
  email_hint: string;
  expires_at: string;
  resend_after_seconds: number;
};

export async function requestAccountVerification(channel?: "email" | "telegram"): Promise<AccountVerification> {
  const response = await apiRequest<VerificationResponse>("/account_verification", { method: "POST", body: JSON.stringify({ channel }) });
  return {
    verificationId: response.verification_id,
    verificationMethod: response.verification_method,
    telegramAvailable: response.telegram_available,
    emailHint: response.email_hint,
    expiresAt: response.expires_at,
    resendAfterSeconds: response.resend_after_seconds,
  };
}

export async function verifyAccount(verificationId: number, code: string) {
  return apiRequest<{ user: AuthUser }>("/account_verification", {
    method: "PATCH",
    body: JSON.stringify({ verification: { verification_id: verificationId, code } }),
  });
}

export async function changeAccountEmail(email: string): Promise<AccountVerification> {
  const response = await apiRequest<VerificationResponse>("/account_verification/email", {
    method: "PATCH",
    body: JSON.stringify({ account: { email } }),
  });
  return {
    verificationId: response.verification_id,
    verificationMethod: response.verification_method,
    telegramAvailable: response.telegram_available,
    emailHint: response.email_hint,
    expiresAt: response.expires_at,
    resendAfterSeconds: response.resend_after_seconds,
  };
}
