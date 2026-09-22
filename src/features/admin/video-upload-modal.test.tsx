// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const videoMocks = vi.hoisted(() => ({
  loadReusable: vi.fn(),
  loadAsset: vi.fn(),
  reuse: vi.fn(),
}));

vi.mock("../../shared/videos/api", () => ({
  attachYouTubeVideo: vi.fn(),
  completeVideoUpload: vi.fn(),
  createVideoUpload: vi.fn(),
  deleteVideoAsset: vi.fn(),
  loadReusableVideoAssets: videoMocks.loadReusable,
  loadVideoAsset: videoMocks.loadAsset,
  retryVideoProcessing: vi.fn(),
  reuseVideoAsset: videoMocks.reuse,
  uploadVideoFile: vi.fn(),
}));

import { VideoUploadModal } from "./video-upload-modal";

const reusableAsset = {
  id: 6,
  lecture_id: 1,
  lecture_title: "المحاضرة الأصلية",
  processing_status: "ready" as const,
  duration_seconds: 3600,
  available_qualities: ["360p", "720p"],
};

beforeEach(() => {
  videoMocks.loadReusable.mockResolvedValue({ video_assets: [reusableAsset] });
  videoMocks.reuse.mockResolvedValue({ video_asset: reusableAsset });
  videoMocks.loadAsset.mockResolvedValue({ video_asset: reusableAsset });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("reusing an uploaded video", () => {
  it("persists the selected asset and refreshes the curriculum", async () => {
    const onReady = vi.fn();
    const onClose = vi.fn();
    render(<VideoUploadModal lecture={{ id: 4, title: "محاضرة الصف الثاني" }} onReady={onReady} onClose={onClose}/>);

    fireEvent.click(screen.getByRole("button", { name: /فيديو سابق/ }));
    const option = await screen.findByRole("radio", { name: /المحاضرة الأصلية/ });
    fireEvent.click(option);
    expect(option).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("button", { name: /تأكيد استخدام: المحاضرة الأصلية/ }));

    await waitFor(() => expect(videoMocks.reuse).toHaveBeenCalledWith(4, 6));
    expect(onReady).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("checking video processing", () => {
  it("recovers a newly attached video even when the curriculum view is stale", async () => {
    const readyAsset = { ...reusableAsset, id: 8, lecture_id: 10, used_by_lectures_count: 1, available_qualities: ["360p", "480p", "720p"] };
    videoMocks.loadReusable.mockResolvedValue({ video_assets: [readyAsset] });

    render(<VideoUploadModal lecture={{ id: 10, title: "محاضرة جديدة" }} onReady={vi.fn()} onClose={vi.fn()}/>);

    expect(await screen.findByText("الفيديو جاهز بالجودات الموضحة أعلاه.")).toBeInTheDocument();
    expect(screen.getByText("720p")).toBeInTheDocument();
  });

  it("lets the teacher refresh a processing video immediately", async () => {
    const processingAsset = { ...reusableAsset, id: 8, lecture_id: 10, used_by_lectures_count: 1, processing_status: "processing" as const, available_qualities: ["480p"] };
    const readyAsset = { ...processingAsset, processing_status: "ready" as const, available_qualities: ["360p", "480p", "720p"] };
    videoMocks.loadReusable.mockResolvedValue({ video_assets: [processingAsset] });
    videoMocks.loadAsset.mockResolvedValue({ video_asset: readyAsset });
    const onReady = vi.fn();

    render(<VideoUploadModal lecture={{ id: 10, title: "محاضرة جديدة" }} onReady={onReady} onClose={vi.fn()}/>);
    fireEvent.click(await screen.findByRole("button", { name: "تحديث الحالة الآن" }));

    await waitFor(() => expect(screen.getByText("الفيديو جاهز بالجودات الموضحة أعلاه.")).toBeInTheDocument());
    expect(onReady).toHaveBeenCalled();
  });
});
