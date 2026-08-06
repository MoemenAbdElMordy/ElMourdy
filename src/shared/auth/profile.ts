import { apiRequest } from "../api/client";
import type { AuthUser } from "./session";

export type LinkedStudent = {
  id: number;
  name: string;
  phone: string;
  birth_date: string;
  governorate?: string;
  status: string;
};

export type ProfileResponse = {
  user: AuthUser;
  profile: {
    birth_date?: string;
    parent_phone?: string;
    governorate?: string;
    verified_phone?: string;
    title?: string;
  };
  linked_students: LinkedStudent[];
};

export function loadProfile() {
  return apiRequest<ProfileResponse>("/profile");
}

export function updateProfile(input: { name?: string; governorate?: string }) {
  return apiRequest<ProfileResponse>("/profile", {
    method: "PATCH",
    body: JSON.stringify({ profile: input }),
  });
}

export function changePassword(input: {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}) {
  return apiRequest<void>("/profile/password", {
    method: "PATCH",
    body: JSON.stringify({
      profile: {
        current_password: input.currentPassword,
        password: input.password,
        password_confirmation: input.passwordConfirmation,
      },
    }),
  });
}
