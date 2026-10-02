export type WatchStatus = "watched" | "partial" | "not_watched";

export function watchStatus(percent: number): WatchStatus {
  const value = Number.isFinite(percent) ? percent : 0;
  return value >= 75 ? "watched" : value >= 20 ? "partial" : "not_watched";
}

export function watchTime(seconds: number): string {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(value / 60).toLocaleString("ar-EG");
  const remainder = String(value % 60).padStart(2, "0").replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
  return `${minutes}:${remainder}`;
}

export function watchPercent(percent: number): string {
  const value = watchPercentValue(percent);
  return `${value.toLocaleString("ar-EG")}٪`;
}

export function watchPercentValue(percent: number): number {
  return Number.isFinite(percent) ? Math.min(100, Math.max(0, Math.round(percent))) : 0;
}

export function assessmentScope(scope: string): string {
  return scope === "Comprehensive" ? "شامل" : scope;
}
