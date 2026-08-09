import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, Clock, Play } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import { loadCurriculum, type Curriculum } from "../../shared/curriculum/api";
import { Badge2, Card2, notify } from "../../shared/ui";

export function StudentCurriculumPage({ nav, params }: any) {
  const [tree, setTree] = useState<Curriculum | null>(null);
  useEffect(() => {
    loadCurriculum()
      .then((r) => setTree(r.curriculum))
      .catch((error) =>
        notify(
          error instanceof ApiError ? error.message : "تعذر تحميل المنهج",
          "error",
        ),
      );
  }, []);
  if (!tree) return <div className="p-8 text-center">جارٍ تحميل المنهج…</div>;
  const requestedChapterId = Number(params?.chapterId);
  const branch =
    tree.branches.find((item) => item.id === Number(params?.subjectId)) ??
    tree.branches.find((item) =>
      item.chapters.some((chapter) => chapter.id === requestedChapterId),
    );
  const chapter = branch?.chapters.find(
    (item) => item.id === requestedChapterId,
  );
  const lectures =
    chapter?.lessons.flatMap((lesson) =>
      lesson.lectures.map((lecture) => ({
        ...lecture,
        lesson_title: lesson.title,
        has_access: lesson.has_access,
      })),
    ) ?? [];
  const items = chapter ? lectures : (branch?.chapters ?? tree.branches);
  const title =
    chapter?.title ?? branch?.title ?? `منهج ${tree.grade?.name ?? "الطالب"}`;
  const open = (item: any) =>
    chapter
      ? item.has_access && item.video_asset?.processing_status === "ready"
        ? nav("video", { lessonId: item.id })
        : item.has_access
          ? undefined
          : nav("activation")
      : branch
        ? nav("lessons", { subjectId: branch.id, chapterId: item.id })
        : nav("chapters", { subjectId: item.id });
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-5">
          {(branch || chapter) && (
            <button
              onClick={() =>
                chapter
                  ? nav("chapters", { subjectId: branch!.id })
                  : nav("subjects")
              }
              className="flex items-center gap-1 text-sm text-muted-foreground mb-2"
            >
              <ChevronLeft size={14} /> رجوع
            </button>
          )}
          <h1 className="text-2xl font-black">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tree.academic_year?.name}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item: any) => {
            const ready =
              !chapter || item.video_asset?.processing_status === "ready";
            return (
              <Card2
                key={item.id}
                className={
                  ready && item.has_access !== false
                    ? "cursor-pointer hover:border-primary"
                    : "opacity-70"
                }
                onClick={() => open(item)}
              >
                <div className="flex gap-3">
                  <BookOpen className="text-primary" />
                  <div className="flex-1">
                    <h2 className="font-bold">{item.title}</h2>
                    {chapter && (
                      <>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.lesson_title}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {item.has_access ? (
                            <Badge2 variant="success">متاح</Badge2>
                          ) : (
                            <Badge2 variant="warning">يحتاج كود</Badge2>
                          )}
                          <Badge2 variant={ready ? "success" : "warning"}>
                            {ready ? "جاهز للمشاهدة" : "قيد المعالجة"}
                          </Badge2>
                        </div>
                      </>
                    )}
                  </div>
                  {chapter && ready ? (
                    <Play size={18} />
                  ) : (
                    <ChevronLeft size={18} />
                  )}
                </div>
                {chapter && item.duration_seconds && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Clock size={12} />
                    {Math.ceil(item.duration_seconds / 60)} دقيقة
                  </p>
                )}
              </Card2>
            );
          })}
        </div>
        {items.length === 0 && (
          <Card2>
            <p className="text-center text-muted-foreground py-8">
              لم يُنشر محتوى لهذا المستوى بعد
            </p>
          </Card2>
        )}
      </div>
    </div>
  );
}
