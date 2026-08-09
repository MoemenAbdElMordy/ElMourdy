import { useEffect, useRef, useState } from "react";
import { CheckCircle, Upload } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import {
  completeVideoUpload,
  createVideoUpload,
  loadVideoAsset,
  retryVideoProcessing,
  uploadVideoFile,
  type VideoAsset,
} from "../../shared/videos/api";
import { Btn, Modal2, notify } from "../../shared/ui";

export function VideoUploadModal({
  lecture,
  onClose,
  onReady,
}: {
  lecture: { id: number; title: string };
  onClose: () => void;
  onReady: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [asset, setAsset] = useState<VideoAsset | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!asset || !["uploaded", "processing"].includes(asset.processing_status))
      return;
    const timer = window.setInterval(async () => {
      try {
        const response = await loadVideoAsset(asset.id);
        setAsset(response.video_asset);
        if (response.video_asset.processing_status === "ready") {
          window.clearInterval(timer);
          onReady();
          notify("الفيديو جاهز للمشاهدة", "success");
        }
        if (response.video_asset.processing_status === "failed")
          window.clearInterval(timer);
      } catch {
        window.clearInterval(timer);
        notify("تعذر متابعة حالة معالجة الفيديو", "error");
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [asset?.id, asset?.processing_status, onReady]);

  const start = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const created = await createVideoUpload(lecture.id, file);
      setAsset(created.video_asset);
      await uploadVideoFile(file, created.upload, setProgress);
      const completed = await completeVideoUpload(
        lecture.id,
        created.video_asset.id,
      );
      setAsset(completed.video_asset);
    } catch (error) {
      notify(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "تعذر رفع الفيديو",
        "error",
      );
      setBusy(false);
    }
  };
  const retry = async () => {
    if (!asset) return;
    setBusy(true);
    try {
      setAsset((await retryVideoProcessing(asset.id)).video_asset);
    } catch (error) {
      notify(
        error instanceof ApiError
          ? error.message
          : "تعذرت إعادة معالجة الفيديو",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };
  const status = asset?.processing_status;
  return (
    <Modal2 open onClose={onClose} title="رفع فيديو المحاضرة">
      <div className="space-y-4">
        <div className="rounded-xl bg-muted p-3 font-bold">{lecture.title}</div>
        {!status && (
          <>
            <input
              ref={inputRef}
              className="hidden"
              type="file"
              accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <button
              className="w-full rounded-2xl border-2 border-dashed border-border p-8 text-center"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mx-auto mb-2 text-primary" />
              <strong>{file?.name ?? "اختر ملف الفيديو"}</strong>
              <p className="mt-2 text-xs text-muted-foreground">
                الحد الأقصى ستة جيجابايت
              </p>
            </button>
            <Btn className="w-full" disabled={!file || busy} onClick={start}>
              ابدأ الرفع
            </Btn>
          </>
        )}
        {busy && progress < 100 && (
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>جارٍ الرفع</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {status === "uploaded" && (
          <div className="rounded-xl bg-primary/10 p-4 text-center">
            تم حفظ الملف، وهو الآن في قائمة انتظار المعالجة. يمكنك إغلاق النافذة
            بأمان.
          </div>
        )}
        {status === "processing" && (
          <div className="rounded-xl bg-primary/10 p-4 text-center">
            بدأ تحويل الفيديو إلى الجودات المختلفة. يمكنك إغلاق النافذة بأمان.
          </div>
        )}
        {status === "failed" && (
          <div className="rounded-xl bg-red-50 p-4 text-center text-red-700">
            فشلت معالجة الفيديو.
            <Btn
              className="mt-3 w-full"
              variant="outline"
              disabled={busy}
              onClick={retry}
            >
              إعادة المعالجة
            </Btn>
          </div>
        )}
        {status === "ready" && (
          <div className="rounded-xl bg-green-50 p-4 text-center text-green-700">
            <CheckCircle className="mx-auto mb-2" />
            الفيديو جاهز للمشاهدة.
          </div>
        )}
      </div>
    </Modal2>
  );
}
