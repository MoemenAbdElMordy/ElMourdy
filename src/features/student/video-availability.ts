import type { Lecture } from "../../shared/curriculum/api";

export function lectureHasPlayableVideo(lecture: Lecture): boolean {
  if (lecture.video_source_type === "youtube") return Boolean(lecture.youtube_video_id);
  const asset = lecture.video_asset;
  return Boolean(asset && (asset.processing_status === "ready" ||
    (asset.processing_status === "processing" && (asset.available_qualities?.length ?? 0) > 0)));
}
