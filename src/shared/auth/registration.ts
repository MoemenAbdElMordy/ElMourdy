import { apiRequest } from "../api/client";
import { acceptSession, deviceFingerprint, deviceMetadata, type AuthRole, type AuthUser } from "./session";

const PENDING_REGISTRATION_KEY = "elmourdy-pending-registration";

export type PendingRegistration = {
  registrationId: number;
  verificationId: number;
  phone: string;
  role: Extract<AuthRole, "student" | "parent">;
  resendAfterSeconds: number;
  expiresAt: string;
  verificationMethod: "email";
  emailHint: string;
  clientToken: string;
};

export function storePendingRegistration(registration: PendingRegistration) {
  sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(registration));
}

export function loadPendingRegistration() {
  const value = sessionStorage.getItem(PENDING_REGISTRATION_KEY);
  return value ? JSON.parse(value) as PendingRegistration : null;
}

export function clearPendingRegistration() {
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
}

type RegistrationResponse = {
  registration_id: number;
  verification_id: number;
  phone: string;
  expires_at: string;
  resend_after_seconds: number;
  verification_method: "email";
  email_hint: string;
  client_token: string;
};

function pendingRegistration(response: RegistrationResponse, role: PendingRegistration["role"]) {
  return {
    registrationId: response.registration_id,
    verificationId: response.verification_id,
    phone: response.phone,
    role,
    resendAfterSeconds: response.resend_after_seconds,
    expiresAt: response.expires_at,
    verificationMethod: response.verification_method,
    emailHint: response.email_hint,
    clientToken: response.client_token,
  };
}

export async function registerStudent(input: {
  name: string;
  phone: string;
  parentPhone: string;
  birthDate: string;
  governorate: string;
  email: string;
  school: string;
  gradeLevel: number;
  password: string;
  passwordConfirmation: string;
}) {
  const response = await apiRequest<RegistrationResponse>("/registrations/student", {
    method: "POST",
    body: JSON.stringify({
      registration: {
        name: input.name,
        phone: input.phone,
        parent_phone: input.parentPhone,
        birth_date: input.birthDate,
        governorate: input.governorate,
        email: input.email,
        school: input.school,
        grade_level: input.gradeLevel,
        password: input.password,
        password_confirmation: input.passwordConfirmation,
      },
    }),
  });
  return pendingRegistration(response, "student");
}

export async function registerParent(input: {
  name: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}) {
  const response = await apiRequest<RegistrationResponse>("/registrations/parent", {
    method: "POST",
    body: JSON.stringify({
      registration: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        password: input.password,
        password_confirmation: input.passwordConfirmation,
      },
    }),
  });
  return pendingRegistration(response, "parent");
}

export async function verifyRegistration(registration: PendingRegistration, code: string) {
  const response = await apiRequest<{ token: string; user: AuthUser }>(
    `/registrations/${registration.registrationId}/verify`,
    {
      method: "POST",
      body: JSON.stringify({
        registration: {
          verification_id: registration.verificationId,
          code,
          device_fingerprint: registration.role === "student" ? deviceFingerprint() : undefined,
          ...(registration.role === "student" ? deviceMetadata() : {}),
        },
      }),
    },
  );
  return acceptSession(response);
}

export async function loadRegistrationStatus(registration: PendingRegistration) {
  return apiRequest<{ status: "pending" | "verified" | "expired" | "failed"; expires_at: string }>(
    `/registrations/${registration.registrationId}/status`,
    {
      method: "POST",
      body: JSON.stringify({
        registration: {
          verification_id: registration.verificationId,
          client_token: registration.clientToken,
        },
      }),
    },
  );
}

export async function completeRegistration(registration: PendingRegistration) {
  const response = await apiRequest<{ token: string; user: AuthUser }>(
    `/registrations/${registration.registrationId}/complete`,
    {
      method: "POST",
      body: JSON.stringify({
        registration: {
          verification_id: registration.verificationId,
          client_token: registration.clientToken,
          device_fingerprint: registration.role === "student" ? deviceFingerprint() : undefined,
          ...(registration.role === "student" ? deviceMetadata() : {}),
        },
      }),
    },
  );
  return acceptSession(response);
}

export async function resendRegistration(registration: PendingRegistration) {
  const response = await apiRequest<RegistrationResponse>(
    `/registrations/${registration.registrationId}/resend`,
    { method: "POST" },
  );
  return pendingRegistration(response, registration.role);
}
