// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const videoMocks = vi.hoisted(() => ({
  loadReusable: vi.fn(),
  reuse: vi.fn(),
}));

vi.mock("../../shared/videos/api", () => ({
  attachYouTubeVideo: vi.fn(),
  completeVideoUpload: vi.fn(),
  createVideoUpload: vi.fn(),
  deleteVideoAsset: vi.fn(),
  loadReusableVideoAssets: videoMocks.loadReusable,
  loadVideoAsset: vi.fn(),
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
