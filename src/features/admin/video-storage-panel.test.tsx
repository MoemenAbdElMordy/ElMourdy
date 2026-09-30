// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const videoMocks = vi.hoisted(() => ({ load: vi.fn(), remove: vi.fn() }));
vi.mock("../../shared/videos/api", () => ({
  loadReusableVideoAssets: videoMocks.load,
  deleteVideoAsset: videoMocks.remove,
}));

import { VideoStoragePanel } from "./video-storage-panel";

beforeEach(() => {
  videoMocks.load.mockImplementation(({ query, page }: {query?:string;page?:number}) => Promise.resolve({
    video_assets: query === "النحو" ? [{ id: 33, lecture_title: "محاضرة النحو", processing_status: "ready", used_by_lectures_count: 1 }] : [],
    pagination: { current_page: page ?? 1, total_pages: 1, total_count: query ? 1 : 0 },
  }));
});

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("video storage management", () => {
  it("searches the server and displays a video outside the initially loaded list", async () => {
    render(<VideoStoragePanel onChange={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("ابحث باسم الفيديو أو رقمه"), { target: { value: "النحو" } });
    expect(await screen.findByText("محاضرة النحو")).toBeInTheDocument();
    expect(videoMocks.load).toHaveBeenCalledWith({ query: "النحو", page: 1 });
  });

  it("does not permanently delete a video when the confirmation is cancelled", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<VideoStoragePanel onChange={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("ابحث باسم الفيديو أو رقمه"), { target: { value: "النحو" } });
    fireEvent.click(await screen.findByRole("button", { name: "حذف نهائي" }));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(videoMocks.remove).not.toHaveBeenCalled();
    confirm.mockRestore();
  });
});
