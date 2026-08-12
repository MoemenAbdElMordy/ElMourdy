import { useEffect, useState } from "react";
import { apiRequest, apiRequestBlob } from "../api/client";

export function useLectureThumbnailUrl(lectureId?: number, hasThumbnail?: boolean) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!lectureId || !hasThumbnail) {
      setUrl(undefined);
      return;
    }

    let active = true;
    let objectUrl: string | undefined;
    apiRequestBlob(`/lectures/${lectureId}/thumbnail`)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => active && setUrl(undefined));

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [lectureId, hasThumbnail]);

  return url;
}

export const uploadLectureThumbnail = (lectureId: number, file: File) =>
  apiRequest<{ thumbnail: { lecture_id: number; has_thumbnail: boolean } }>(
    `/lectures/${lectureId}/thumbnail`,
    { method: "PUT", headers: { "Content-Type": file.type }, body: file },
  );

export const deleteLectureThumbnail = (lectureId: number) =>
  apiRequest<void>(`/lectures/${lectureId}/thumbnail`, { method: "DELETE" });
