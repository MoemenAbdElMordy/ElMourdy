import { apiRequest, getSessionToken } from "../api/client";

export type VideoAsset = {
  id: number;
  lecture_id: number;
  processing_status: "uploaded" | "processing" | "ready" | "failed";
  duration_seconds?: number;
  available_qualities?: string[];
};

type UploadInstructions = {
  url: string;
  method: "PUT";
  headers: Record<string, string>;
  requires_authentication: boolean;
};

export type Playback = {
  lecture: { id:number; title:string; duration_seconds?:number };
  video_asset_id: number;
  qualities: Record<string,string>;
  watch_event_id?: number;
  last_position_seconds: number;
  watermark?: { name:string; phone:string };
};

export function createVideoUpload(lectureId:number,file:File) {
  return apiRequest<{video_asset:VideoAsset;upload:UploadInstructions}>(`/lectures/${lectureId}/video_upload`,{
    method:"POST",
    body:JSON.stringify({filename:file.name,content_type:file.type,size_bytes:file.size}),
  });
}

export function uploadVideoFile(file:File,instructions:UploadInstructions,onProgress:(progress:number)=>void) {
  return new Promise<void>((resolve,reject)=>{
    const request=new XMLHttpRequest();
    request.open(instructions.method,instructions.url);
    Object.entries(instructions.headers).forEach(([key,value])=>request.setRequestHeader(key,value));
    if(instructions.requires_authentication){
      const token=getSessionToken();
      if(token)request.setRequestHeader("Authorization",`Bearer ${token}`);
    }
    request.upload.onprogress=(event)=>{if(event.lengthComputable)onProgress(Math.round(event.loaded/event.total*100));};
    request.onload=()=>request.status>=200&&request.status<300?resolve():reject(new Error("Video upload failed"));
    request.onerror=()=>reject(new Error("Video upload failed"));
    request.send(file);
  });
}

export const completeVideoUpload=(lectureId:number,videoAssetId:number)=>apiRequest<{video_asset:VideoAsset}>(`/lectures/${lectureId}/video_upload/complete`,{
  method:"POST",body:JSON.stringify({video_asset_id:videoAssetId}),
});
export const loadVideoAsset=(id:number)=>apiRequest<{video_asset:VideoAsset}>(`/video_assets/${id}`);
export const loadVideoPlayback=(lectureId:number)=>apiRequest<{playback:Playback}>(`/lectures/${lectureId}/video_playback`);
export const saveWatchProgress=(eventId:number,positionSeconds:number)=>apiRequest(`/lecture_watch_events/${eventId}`,{
  method:"PATCH",body:JSON.stringify({position_seconds:Math.floor(positionSeconds)}),
});
