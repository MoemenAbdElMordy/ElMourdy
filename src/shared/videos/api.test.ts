// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadVideoFile } from "./api";

afterEach(() => vi.unstubAllGlobals());

describe("resumable video upload", () => {
  it("sends bounded chunks and resumes from the server-confirmed offset", async () => {
    const size = 4 * 1024 * 1024 + 3;
    const file = new File([new Uint8Array(size)], "lecture.mp4", { type: "video/mp4" });
    let stored = 0;
    const sent: Array<{ offset: number; size: number }> = [];
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ uploaded_bytes: stored, expected_size_bytes: size }),
    })));
    class FakeRequest {
      status = 200;
      responseText = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      private offset = 0;
      open() {}
      setRequestHeader(name: string, value: string) { if (name === "X-Upload-Offset") this.offset = Number(value); }
      send(blob: Blob) {
        sent.push({ offset: this.offset, size: blob.size });
        stored = this.offset + blob.size;
        this.responseText = JSON.stringify({ uploaded_bytes: stored });
        this.onload?.();
      }
    }
    vi.stubGlobal("XMLHttpRequest", FakeRequest);
    const progress: number[] = [];
    await uploadVideoFile(file, {
      url: "/legacy", chunk_url: "/chunks", status_url: "/status",
      method: "PUT", headers: {}, requires_authentication: true,
    }, value => progress.push(value));
    expect(sent).toEqual([
      { offset: 0, size: 4 * 1024 * 1024 },
      { offset: 4 * 1024 * 1024, size: 3 },
    ]);
    expect(progress.at(-1)).toBe(100);

    sent.length = 0;
    await uploadVideoFile(file, {
      url: "/legacy", chunk_url: "/chunks", status_url: "/status",
      method: "PUT", headers: {}, requires_authentication: true,
    }, () => {});
    expect(sent).toHaveLength(0);
  });
});
