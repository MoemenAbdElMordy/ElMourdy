import { apiRequest } from "../api/client";

export type StudentDevice = {
  id: number;
  name: string;
  browser?: string;
  os?: string;
  ip_address?: string;
  last_seen_at: string;
  created_at: string;
  current: boolean;
  can_self_remove: boolean;
  pending_removal_request: boolean;
};

export type DevicesResponse = {
  devices: StudentDevice[];
  limit: number;
};

export function loadDevices() {
  return apiRequest<DevicesResponse>("/devices");
}

export function removeDevice(id: number) {
  return apiRequest<void>(`/devices/${id}`, { method: "DELETE" });
}

export function requestDeviceRemoval(id: number, reason: string) {
  return apiRequest<{ request_id: number; status: string }>(`/devices/${id}/removal_request`, {
    method: "POST",
    body: JSON.stringify({ removal_request: { reason } }),
  });
}
