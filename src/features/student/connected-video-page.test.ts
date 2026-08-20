import { describe, expect, it } from "vitest";
import { canPlay, type LectureContext } from "./connected-video-page";

function context({
  lessonAccess,
  lectureAccess,
  processingStatus = "ready",
}: {
  lessonAccess: boolean;
  lectureAccess: boolean;
  processingStatus?: "uploaded" | "processing" | "ready" | "failed";
}) {
  return {
    lesson: { has_access: lessonAccess },
    lecture: {
      has_access: lectureAccess,
      video_asset: { processing_status: processingStatus },
    },
  } as LectureContext;
}

describe("student video availability", () => {
  it("allows a free lecture inside a locked lesson", () => {
    expect(canPlay(context({ lessonAccess: false, lectureAccess: true }))).toBe(
      true,
    );
  });

  it("keeps an inaccessible lecture locked", () => {
    expect(canPlay(context({ lessonAccess: true, lectureAccess: false }))).toBe(
      false,
    );
  });

  it("waits until the video is ready", () => {
    expect(
      canPlay(
        context({
          lessonAccess: false,
          lectureAccess: true,
          processingStatus: "processing",
        }),
      ),
    ).toBe(false);
  });
});
