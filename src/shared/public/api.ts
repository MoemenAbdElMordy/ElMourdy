import { API_BASE_URL, apiRequest } from "../api/client";

export type FreeLecture = {
  id: number;
  title: string;
  description?: string | null;
  duration_seconds?: number | null;
  available_qualities: string[];
  has_thumbnail: boolean;
  branch: { id: number; title: string };
  grade: { id: number; name: string; level: number };
};

export function freeLectureThumbnailUrl(lectureId: number) {
  return `${API_BASE_URL}/free_lectures/${lectureId}/thumbnail`;
}

export function loadFreeLectures() {
  return apiRequest<{ lectures: FreeLecture[] }>("/free_lectures");
}

export type PublicGrade = { id: number; name: string; level: number };

export function loadGrades() {
  return apiRequest<{ grades: PublicGrade[] }>("/grades");
}
