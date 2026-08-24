import { apiRequest, getSessionToken } from "../api/client";

export type VideoAsset = {
  id: number;
  lecture_id: number;
  processing_status: "uploaded" | "processing" | "ready" | "failed";
  duration_seconds?: number;
  available_qualities?: string[];
  variants?: Array<{ quality: string; status: string; size_bytes?: number }>;
  lecture_title?: string;
  storage_size_bytes?: number;
  used_by_lectures_count?: number;
  can_delete?: boolean;
};

type UploadInstructions = {
  url: string;
  method: "PUT";
  headers: Record<string, string>;
  requires_authentication: boolean;
};

export type Playback = {
  lecture: { id: number; title: string; description?: string; attachment_name?: string; attachment_url?: string; has_thumbnail?: boolean; duration_seconds?: number };
  source_type: "uploaded" | "youtube";
  video_asset_id?: number;
  youtube_video_id?: string;
  qualities: Record<string, string>;
  watch_event_id?: number;
  last_position_seconds: number;
  watched_seconds: number;
  watermark?: { name: string; phone: string; viewer_id: number };
};

export type WatchProgress = {
  id: number;
  last_position_seconds: number;
  watched_seconds: number;
  verified_watched_seconds: number;
  accepted_seconds: number;
  progress_percent: number;
  completed_at?: string;
};

export function createVideoUpload(lectureId: number, file: File) {
  return apiRequest<{ video_asset: VideoAsset; upload: UploadInstructions }>(
    `/lectures/${lectureId}/video_upload`,
    {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type,
        size_bytes: file.size,
      }),
    },
  );
}

export function uploadVideoFile(
  file: File,
  instructions: UploadInstructions,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(instructions.method, instructions.url);
    Object.entries(instructions.headers).forEach(([key, value]) =>
      request.setRequestHeader(key, value),
    );
    if (instructions.requires_authentication) {
      const token = getSessionToken();
      if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    request.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error("Video upload failed"));
    request.onerror = () => reject(new Error("Video upload failed"));
    request.send(file);
  });
}

export const completeVideoUpload = (lectureId: number, videoAssetId: number) =>
  apiRequest<{ video_asset: VideoAsset }>(
    `/lectures/${lectureId}/video_upload/complete`,
    {
      method: "POST",
      body: JSON.stringify({ video_asset_id: videoAssetId }),
    },
  );
export const attachYouTubeVideo = (lectureId:number,url:string) =>
  apiRequest(`/lectures/${lectureId}/video_upload/youtube`,{method:"POST",body:JSON.stringify({url})});
export const reuseVideoAsset = (lectureId:number,videoAssetId:number) =>
  apiRequest<{video_asset:VideoAsset}>(`/lectures/${lectureId}/video_upload/reuse`,{method:"POST",body:JSON.stringify({video_asset_id:videoAssetId})});
export const loadReusableVideoAssets = () =>
  apiRequest<{video_assets:VideoAsset[]}>("/video_assets?per_page=100");
export const loadVideoAsset = (id: number) =>
  apiRequest<{ video_asset: VideoAsset }>(`/video_assets/${id}`);
export const retryVideoProcessing = (id: number) =>
  apiRequest<{ video_asset: VideoAsset }>(
    `/video_assets/${id}/retry_processing`,
    { method: "POST" },
  );
export const deleteVideoAsset = (id: number) =>
  apiRequest<void>(`/video_assets/${id}`, { method: "DELETE" });
export const loadVideoPlayback = (lectureId: number) =>
  apiRequest<{ playback: Playback }>(`/lectures/${lectureId}/video_playback`);
export const saveWatchProgress = (
  eventId: number,
  positionSeconds: number,
  watchedSecondsDelta: number,
) =>
  apiRequest<{ watch_event: WatchProgress }>(`/lecture_watch_events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify({
      position_seconds: Math.floor(positionSeconds),
      watched_seconds_delta: Math.floor(watchedSecondsDelta),
    }),
  });
