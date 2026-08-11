import { apiRequest } from "../api/client";

export type FreeLecture = {
  id: number;
  title: string;
  duration_seconds?: number | null;
  available_qualities: string[];
  branch: { id: number; title: string };
  grade: { id: number; name: string };
};

export function loadFreeLectures() {
  return apiRequest<{ lectures: FreeLecture[] }>("/free_lectures");
}

export type PublicGrade = { id: number; name: string; level: number };

export function loadGrades() {
  return apiRequest<{ grades: PublicGrade[] }>("/grades");
}
