import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Hls from "hls.js";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  ListVideo,
  LoaderCircle,
  LockKeyhole,
  Menu,
  Play,
  Shield,
  X,
} from "lucide-react";
import { ApiError } from "../../shared/api/client";
import {
  loadCurriculum,
  type Branch,
  type Chapter,
  type Curriculum,
  type Lecture,
  type Lesson,
} from "../../shared/curriculum/api";
import type { Navigate, Role, RouteParams } from "../../app/routing/types";
import {
  loadVideoPlayback,
  saveWatchProgress,
  type Playback,
} from "../../shared/videos/api";
import { Btn, Card2, cn, notify } from "../../shared/ui";
import { useLectureThumbnailUrl } from "../../shared/media/lecture-thumbnail";

const preferredQualityOrder = ["480p", "720p", "360p"];
const displayedQualityOrder = ["720p", "480p", "360p"];

type LectureContext = {
  branch: Branch;
  chapter: Chapter;
  lesson: Lesson;
  lecture: Lecture;
};

type PageTab = "overview" | "files" | "notes";

function findLectureContext(
  curriculum: Curriculum,
  lectureId: number,
): LectureContext | null {
  for (const branch of curriculum.branches) {
    for (const chapter of branch.chapters) {
      for (const lesson of chapter.lessons) {
        const lecture = lesson.lectures.find((item) => item.id === lectureId);
        if (lecture) return { branch, chapter, lesson, lecture };
      }
    }
  }
  return null;
}

function flattenBranchLectures(branch: Branch): LectureContext[] {
  return branch.chapters.flatMap((chapter) =>
    chapter.lessons.flatMap((lesson) =>
      lesson.lectures.map((lecture) => ({
        branch,
        chapter,
        lesson,
        lecture,
      })),
    ),
  );
}

function canPlay(item: LectureContext) {
  return (
    item.lesson.has_access !== false &&
    item.lecture.video_asset?.processing_status === "ready"
  );
}

function formatDuration(seconds?: number) {
  if (!seconds) return "المدة غير محددة";
  const totalMinutes = Math.ceil(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} دقيقة`;
  return minutes ? `${hours} ساعة و${minutes} دقيقة` : `${hours} ساعة`;
}

export function ConnectedVideoPage({
  nav,
  params,
  role,
}: {
  nav: Navigate;
  params?: RouteParams;
  role?: Role;
}) {
  const lectureId = Number(params?.lessonId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resumePositionRef = useRef(0);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [quality, setQuality] = useState("");
  const [error, setError] = useState("");
  const [currentPosition, setCurrentPosition] = useState(0);
  const [watermarkPosition, setWatermarkPosition] = useState(0);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<PageTab>("overview");
  const [notes, setNotes] = useState("");
  const thumbnailUrl = useLectureThumbnailUrl(
    playback?.lecture.id,
    playback?.lecture.has_thumbnail,
  );

  useEffect(() => {
    loadCurriculum()
      .then((response) => setCurriculum(response.curriculum))
      .catch(() => setCurriculum(null));
  }, []);

  useEffect(() => {
    if (!lectureId) {
      setError("المحاضرة المطلوبة غير موجودة");
      return;
    }

    setError("");
    setPlayback(null);
    loadVideoPlayback(lectureId)
      .then((response) => {
        setPlayback(response.playback);
        resumePositionRef.current = response.playback.last_position_seconds;
        setCurrentPosition(response.playback.last_position_seconds);
        const available =
          preferredQualityOrder.find(
            (item) => response.playback.qualities[item],
          ) ?? Object.keys(response.playback.qualities)[0];
        setQuality(available ?? "");
      })
      .catch((reason) =>
        setError(
          reason instanceof ApiError
            ? reason.message
            : "تعذر تشغيل الفيديو",
        ),
      );
  }, [lectureId]);

  const context = useMemo(
    () =>
      curriculum && lectureId
        ? findLectureContext(curriculum, lectureId)
        : null,
    [curriculum, lectureId],
  );

  const branchLectures = useMemo(
    () => (context ? flattenBranchLectures(context.branch) : []),
    [context],
  );
  const playableLectures = useMemo(
    () => branchLectures.filter(canPlay),
    [branchLectures],
  );
  const currentPlayableIndex = playableLectures.findIndex(
    (item) => item.lecture.id === lectureId,
  );
  const previousLecture =
    currentPlayableIndex > 0 ? playableLectures[currentPlayableIndex - 1] : null;
  const nextLecture =
    currentPlayableIndex >= 0 &&
    currentPlayableIndex < playableLectures.length - 1
      ? playableLectures[currentPlayableIndex + 1]
      : null;

  useEffect(() => {
    if (!context) return;
    setOpenChapters((current) => {
      if (current.has(context.chapter.id)) return current;
      return new Set([...current, context.chapter.id]);
    });
  }, [context]);

  useEffect(() => {
    const storageKey = `lecture-notes-${lectureId}`;
    setNotes(window.localStorage.getItem(storageKey) ?? "");
  }, [lectureId]);

  useEffect(() => {
    const source = playback?.qualities[quality];
    const video = videoRef.current;
    if (!source || !video) return;

    let hls: Hls | null = null;
    const restorePosition = () => {
      if (resumePositionRef.current > 0 && video.currentTime < 1) {
        video.currentTime = resumePositionRef.current;
      }
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        xhrSetup: (request, url) => {
          if (url.includes(".ngrok-free.")) {
            request.setRequestHeader("ngrok-skip-browser-warning", "true");
          }
        },
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, restorePosition);
    } else {
      video.src = source;
      video.addEventListener("loadedmetadata", restorePosition, { once: true });
    }

    return () => {
      if (Number.isFinite(video.currentTime) && video.currentTime > 0) {
        resumePositionRef.current = video.currentTime;
      }
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [playback, quality]);

  useEffect(() => {
    if (!playback?.watch_event_id) return;
    const save = () => {
      const position = videoRef.current?.currentTime;
      if (position !== undefined) {
        void saveWatchProgress(playback.watch_event_id!, position);
      }
    };
    const timer = window.setInterval(save, 15_000);
    const video = videoRef.current;
    video?.addEventListener("pause", save);
    video?.addEventListener("ended", save);
    return () => {
      window.clearInterval(timer);
      video?.removeEventListener("pause", save);
      video?.removeEventListener("ended", save);
      save();
    };
  }, [playback?.watch_event_id]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setWatermarkPosition((value) => (value + 1) % 4),
      12_000,
    );
    return () => window.clearInterval(timer);
  }, []);

  const goBack = () => {
    if (context) {
      nav("lessons", {
        subjectId: context.branch.id,
        chapterId: context.chapter.id,
      });
      return;
    }
    nav("subjects");
  };

  if (role === "parent") {
    return (
      <CenteredMessage
        icon={<Shield />}
        message="تشغيل الفيديو متاح للطالب فقط."
        onBack={() => nav("parent-dashboard")}
      />
    );
  }
  if (error) return <CenteredMessage message={error} onBack={goBack} />;
  if (!playback) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="animate-spin text-primary" />
      </div>
    );
  }

  const duration =
    playback.lecture.duration_seconds ?? context?.lecture.duration_seconds;
  const watchProgress = duration
    ? Math.min(100, Math.round((currentPosition / duration) * 100))
    : 0;
  const watermarkPositions = [
    "top-[15%] left-[10%]",
    "top-[15%] right-[10%]",
    "bottom-[18%] left-[10%]",
    "bottom-[18%] right-[10%]",
  ];
  const availableQualities = displayedQualityOrder.filter(
    (item) => playback.qualities[item],
  );

  const openLecture = (item: LectureContext) => {
    if (!canPlay(item)) return;
    setMobileSidebar(false);
    nav("video", { lessonId: item.lecture.id });
  };

  const toggleChapter = (chapterId: number) => {
    setOpenChapters((current) => {
      const next = new Set(current);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const saveNotes = () => {
    window.localStorage.setItem(`lecture-notes-${lectureId}`, notes);
    notify("تم حفظ ملاحظاتك على هذا الجهاز", "success");
  };

  const curriculumContent = context ? (
    <CurriculumSidebar
      branch={context.branch}
      currentLectureId={lectureId}
      openChapters={openChapters}
      onToggleChapter={toggleChapter}
      onOpenLecture={openLecture}
      watchProgress={watchProgress}
    />
  ) : (
    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
      تعذر تحميل محتوى المادة، لكن يمكنك متابعة الفيديو.
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-16 z-30 flex items-center gap-2 border-b border-border bg-card px-3 py-2 lg:hidden">
        <button
          aria-label="العودة إلى قائمة المحاضرات"
          onClick={goBack}
          className="shrink-0 rounded-xl p-2 hover:bg-accent"
        >
          <ChevronRight size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] text-muted-foreground">
            {context
              ? `${context.branch.title} • ${context.chapter.title}`
              : "مشاهدة المحاضرة"}
          </div>
          <div className="truncate text-sm font-bold">
            {playback.lecture.title}
          </div>
        </div>
        <button
          aria-label="فتح محتوى المادة"
          onClick={() => setMobileSidebar(true)}
          className="flex shrink-0 items-center gap-1 rounded-xl p-2 text-xs font-semibold hover:bg-accent"
        >
          <Menu size={16} />
          <span className="hidden sm:inline">المحتوى</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col lg:h-[calc(100vh-64px)] lg:flex-row lg:overflow-hidden" dir="ltr">
        <main className="min-w-0 flex-1 overflow-y-auto" dir="rtl">
          <section className="group relative aspect-video w-full overflow-hidden bg-black">
            <video
              ref={videoRef}
              controls
              playsInline
              poster={thumbnailUrl}
              className="h-full w-full"
              onTimeUpdate={(event) =>
                setCurrentPosition(event.currentTarget.currentTime)
              }
            />
            {playback.watermark && (
              <div
                className={cn(
                  "pointer-events-none absolute select-none rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-bold text-white/30 transition-all duration-700",
                  watermarkPositions[watermarkPosition],
                )}
              >
                {playback.watermark.name} • {playback.watermark.phone}
              </div>
            )}
            <label className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-white/15 bg-black/65 px-2 py-1 text-xs text-white backdrop-blur-sm">
              الجودة
              <select
                aria-label="جودة الفيديو"
                value={quality}
                onChange={(event) => setQuality(event.target.value)}
                className="bg-transparent font-bold text-white outline-none"
              >
                {availableQualities.map((item) => (
                  <option key={item} value={item} className="bg-black">
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <div className="flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3">
            <Btn
              variant="outline"
              size="sm"
              disabled={!previousLecture}
              onClick={() => previousLecture && openLecture(previousLecture)}
            >
              <ChevronRight size={14} /> السابقة
            </Btn>
            <div className="min-w-0 flex-1 truncate px-2 text-center text-xs font-medium text-muted-foreground">
              {playback.lecture.title}
            </div>
            <Btn
              size="sm"
              disabled={!nextLecture}
              onClick={() => nextLecture && openLecture(nextLecture)}
            >
              التالية <ChevronLeft size={14} />
            </Btn>
          </div>

          <div className="px-5 py-5 md:px-7">
            {context && (
              <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <button onClick={() => nav("subjects")} className="hover:text-primary">
                  المواد
                </button>
                <ChevronLeft size={10} />
                <button
                  onClick={() => nav("chapters", { subjectId: context.branch.id })}
                  className="hover:text-primary"
                >
                  {context.branch.title}
                </button>
                <ChevronLeft size={10} />
                <button onClick={goBack} className="hover:text-primary">
                  {context.chapter.title}
                </button>
                <ChevronLeft size={10} />
                <span className="text-foreground">{playback.lecture.title}</span>
              </nav>
            )}

            <h1 className="mb-2 text-xl font-black">
              {playback.lecture.title}
            </h1>
            <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock3 size={14} /> {formatDuration(duration)}
              </span>
              {playback.last_position_seconds > 0 && (
                <span>استكملت المشاهدة من آخر نقطة وصلت إليها</span>
              )}
            </div>

            <div
              role="tablist"
              aria-label="تفاصيل المحاضرة"
              className="mb-5 flex overflow-x-auto border-b border-border"
            >
              {(
                [
                  { id: "overview", label: "نظرة عامة" },
                  { id: "files", label: "الملفات" },
                  { id: "notes", label: "ملاحظاتي" },
                ] as Array<{ id: PageTab; label: string }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" ? (
              <div className="max-w-3xl space-y-4 text-sm">
                <p className="leading-loose text-muted-foreground">
                  {playback.lecture.description || (context
                    ? `هذه المحاضرة جزء من درس ${context.lesson.title} في ${context.chapter.title}.`
                    : "يمكنك مشاهدة المحاضرة واختيار الجودة المناسبة لسرعة اتصالك.")}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard
                    icon={<ListVideo size={17} />}
                    label="المحاضرة الحالية"
                    value={
                      currentPlayableIndex >= 0
                        ? `${currentPlayableIndex + 1} من ${playableLectures.length}`
                        : "متاحة للمشاهدة"
                    }
                  />
                  <InfoCard
                    icon={<Play size={17} />}
                    label="تقدم المشاهدة"
                    value={`${watchProgress}%`}
                  />
                </div>
              </div>
            ) : activeTab === "files" ? (
              playback.lecture.attachment_url ? (
                <a href={playback.lecture.attachment_url} target="_blank" rel="noreferrer" className="flex max-w-2xl items-center gap-3 rounded-2xl border border-border bg-card p-5 text-sm font-semibold hover:border-primary hover:text-primary">
                  <FileText size={22} />
                  {playback.lecture.attachment_name || "فتح ملف المحاضرة"}
                </a>
              ) : (
                <div className="flex max-w-2xl items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
                  <FileText size={22} />
                  لا توجد ملفات مرفقة بهذه المحاضرة حاليًا.
                </div>
              )
            ) : (
              <div className="max-w-2xl">
                <label htmlFor="lecture-notes" className="mb-2 block text-sm font-bold">
                  ملاحظاتك الشخصية
                </label>
                <textarea
                  id="lecture-notes"
                  rows={6}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="اكتب ملاحظاتك أثناء المشاهدة..."
                  className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    تُحفظ الملاحظات على هذا الجهاز فقط.
                  </p>
                  <Btn size="sm" onClick={saveNotes}>
                    حفظ الملاحظات
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside
          className="hidden w-[360px] shrink-0 flex-col overflow-hidden border-l border-border bg-card lg:flex xl:w-[400px]"
          dir="rtl"
        >
          {curriculumContent}
        </aside>
      </div>

      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="إغلاق محتوى المادة"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setMobileSidebar(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[88vw] max-w-[380px] flex-col bg-card shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-bold">محتوى المادة</span>
              <button
                aria-label="إغلاق محتوى المادة"
                onClick={() => setMobileSidebar(false)}
                className="rounded-xl p-2 hover:bg-accent"
              >
                <X size={17} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {curriculumContent}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function CurriculumSidebar({
  branch,
  currentLectureId,
  openChapters,
  onToggleChapter,
  onOpenLecture,
  watchProgress,
}: {
  branch: Branch;
  currentLectureId: number;
  openChapters: Set<number>;
  onToggleChapter: (chapterId: number) => void;
  onOpenLecture: (item: LectureContext) => void;
  watchProgress: number;
}) {
  const allLectures = flattenBranchLectures(branch);
  const readyLectures = allLectures.filter(canPlay).length;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (watchProgress / 100) * circumference;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border bg-card/50 p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-[52px] w-[52px] shrink-0">
            <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
              <circle
                cx="26"
                cy="26"
                r={radius}
                fill="none"
                stroke="var(--muted)"
                strokeWidth="4"
              />
              <circle
                cx="26"
                cy="26"
                r={radius}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                transform="rotate(-90 26 26)"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-primary">
              {watchProgress}%
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{branch.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {readyLectures} من {allLectures.length} محاضرة جاهزة
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary transition-all"
                style={{ width: `${watchProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {branch.chapters.map((chapter, chapterIndex) => {
          const chapterItems = chapter.lessons.flatMap((lesson) =>
            lesson.lectures.map((lecture) => ({
              branch,
              chapter,
              lesson,
              lecture,
            })),
          );
          const readyCount = chapterItems.filter(canPlay).length;
          const isOpen = openChapters.has(chapter.id);

          return (
            <section
              key={chapter.id}
              className="border-b border-border/60 last:border-0"
            >
              <button
                onClick={() => onToggleChapter(chapter.id)}
                className="flex w-full items-center gap-2 px-4 py-3 text-right hover:bg-accent/40"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                  {chapterIndex + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold">
                    {chapter.title}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">
                    {readyCount} من {chapterItems.length} محاضرة
                  </span>
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen && (
                <div className="pb-1">
                  {chapter.lessons.map((lesson) => (
                    <div key={lesson.id}>
                      <div className="px-5 pb-1 pt-2 text-[11px] font-bold text-muted-foreground">
                        {lesson.title}
                      </div>
                      {lesson.lectures.map((lecture) => {
                        const item = { branch, chapter, lesson, lecture };
                        const isCurrent = lecture.id === currentLectureId;
                        const accessible = lesson.has_access !== false;
                        const ready =
                          lecture.video_asset?.processing_status === "ready";

                        return (
                          <button
                            key={lecture.id}
                            disabled={!accessible || !ready}
                            onClick={() => onOpenLecture(item)}
                            className={cn(
                              "flex w-full items-center gap-2.5 border-r-2 px-5 py-2.5 text-right text-xs transition-colors",
                              isCurrent
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-transparent hover:bg-accent/60",
                              (!accessible || !ready) &&
                                "cursor-not-allowed opacity-55",
                            )}
                          >
                            <span className="flex w-4 shrink-0 items-center justify-center">
                              {!accessible ? (
                                <LockKeyhole size={11} />
                              ) : isCurrent ? (
                                <Play size={11} fill="currentColor" />
                              ) : ready ? (
                                <Play size={11} />
                              ) : (
                                <LoaderCircle size={11} />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              {lecture.title}
                            </span>
                            <span className="shrink-0 text-[10px] opacity-70">
                              {!accessible
                                ? "مغلق"
                                : isCurrent
                                  ? "تشاهد الآن"
                                  : ready
                                    ? formatDuration(
                                        lecture.duration_seconds ??
                                          lecture.video_asset?.duration_seconds,
                                      )
                                    : "قيد التجهيز"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 font-bold">{value}</div>
      </div>
    </div>
  );
}

function CenteredMessage({
  message,
  onBack,
  icon,
}: {
  message: string;
  onBack: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card2 className="w-full max-w-md text-center">
        {icon && (
          <div className="mx-auto mb-3 flex justify-center text-muted-foreground">
            {icon}
          </div>
        )}
        <p className="mb-4 font-bold">{message}</p>
        <Btn onClick={onBack}>العودة</Btn>
      </Card2>
    </div>
  );
}
