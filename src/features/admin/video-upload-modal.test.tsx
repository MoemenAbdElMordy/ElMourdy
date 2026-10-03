// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const videoMocks = vi.hoisted(() => ({
  loadReusable: vi.fn(),
  reuse: vi.fn(),
  loadAsset: vi.fn(),
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
import { completeVideoUpload, createVideoUpload, uploadVideoFile } from "../../shared/videos/api";

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
  it("does not finalize a video after an interrupted upload", async () => {
    vi.mocked(createVideoUpload).mockResolvedValue({
      video_asset: { ...reusableAsset, id: 77, processing_status: "uploaded" },
      upload: { url: "/api/test-upload", method: "PUT", headers: {}, requires_authentication: true },
    } as never);
    vi.mocked(uploadVideoFile).mockRejectedValue(new Error("انقطع الاتصال أثناء الرفع"));
    render(<VideoUploadModal lecture={{ id: 4, title: "محاضرة اختبار" }} onReady={vi.fn()} onClose={vi.fn()}/>);
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [new File(["video"], "test.mp4", { type: "video/mp4" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: "ابدأ الرفع" }));
    await waitFor(() => expect(uploadVideoFile).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByRole("button", { name: "رفع الفيديو البديل" })).toBeEnabled());
    expect(completeVideoUpload).not.toHaveBeenCalled();
  });

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
  it("finds an older uploaded video through server search", async () => {
    videoMocks.loadReusable.mockImplementation(({query}: {query?:string} = {}) => Promise.resolve({
      video_assets: query === "النحو" ? [{...reusableAsset,id:88,lecture_title:"محاضرة النحو القديمة"}] : [],
      pagination: {current_page:1,total_pages:1,total_count:1},
    }));
    render(<VideoUploadModal lecture={{ id: 4, title: "محاضرة الصف الثاني" }} onReady={vi.fn()} onClose={vi.fn()}/>);
    fireEvent.click(screen.getByRole("button", { name: /فيديو سابق/ }));
    fireEvent.change(screen.getByPlaceholderText("ابحث عن فيديو مرفوع"), {target:{value:"النحو"}});
    expect(await screen.findByRole("radio", {name:/محاضرة النحو القديمة/})).toBeInTheDocument();
    expect(videoMocks.loadReusable).toHaveBeenCalledWith({query:"النحو",page:1});
  });
  it("warns when the video is missing one of the required qualities", async () => {
    render(<VideoUploadModal lecture={{ id: 1, title: "محاضرة بجودة ناقصة" }} existingAsset={reusableAsset} onReady={vi.fn()} onClose={vi.fn()}/>);
    expect(await screen.findByText("بعض الجودات جاهزة — ننتظر الباقي")).toBeInTheDocument();
    expect(screen.getByText(/تجهيز الجودات المتبقية مستمر/)).toBeInTheDocument();
  });
});
