import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, Clock, Play } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import { loadCurriculum, type Curriculum, type Lecture } from "../../shared/curriculum/api";
import { useLectureThumbnailUrl } from "../../shared/media/lecture-thumbnail";
import { Badge2, Card2 } from "../../shared/ui";

type StudentLecture = Lecture & { lesson_title: string; has_access?: boolean };

function LectureCard({ lecture, open }: { lecture: StudentLecture; open: () => void }) {
  const thumbnailUrl = useLectureThumbnailUrl(lecture.id, lecture.has_thumbnail);
  const ready = lecture.video_asset?.processing_status === "ready";
  const position = lecture.progress?.last_position_seconds ?? 0;
  const duration = lecture.duration_seconds ?? lecture.video_asset?.duration_seconds ?? 0;
  const progress = lecture.progress?.completed ? 100 : duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;

  return (
    <button type="button" onClick={open} disabled={!ready} className="group overflow-hidden rounded-2xl border border-border bg-card text-right shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-65">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {thumbnailUrl ? <img src={thumbnailUrl} alt={`صورة محاضرة ${lecture.title}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : <div className="grid h-full place-items-center bg-gradient-to-br from-primary/15 to-primary/5"><BookOpen className="text-primary" size={38} /></div>}
        {ready && lecture.has_access && <span className="absolute inset-0 grid place-items-center bg-black/10 opacity-0 transition group-hover:opacity-100"><span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-primary shadow"><Play size={20} fill="currentColor" /></span></span>}
        {progress > 0 && <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/35"><div className="h-full bg-red-600" style={{ width: `${progress}%` }} /></div>}
      </div>
      <div className="p-4">
        <h2 className="line-clamp-2 font-black">{lecture.title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{lecture.lesson_title}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge2 variant={lecture.has_access ? "success" : "warning"}>{lecture.has_access ? "متاح" : "يحتاج كود"}</Badge2>
          <Badge2 variant={ready ? "success" : "warning"}>{ready ? "جاهز للمشاهدة" : "قيد المعالجة"}</Badge2>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock size={12} />{Math.ceil(duration / 60)} دقيقة</span>
          {position > 0 && <span>{lecture.progress?.completed ? "مكتملة" : `شاهدت ${progress}%`}</span>}
        </div>
      </div>
    </button>
  );
}

export function StudentCurriculumPage({ nav, params }: any) {
  const [tree, setTree] = useState<Curriculum | null>(null);
  const [error, setError] = useState("");
  const load = () => {
    setError("");
    loadCurriculum().then((response) => setTree(response.curriculum)).catch((reason) => setError(reason instanceof ApiError ? reason.message : "تعذر تحميل المنهج"));
  };
  useEffect(() => { load(); }, []);
  if (error) return <div className="p-8 text-center"><Card2 className="max-w-md mx-auto"><p className="mb-4">{error}</p><button className="btn-primary" onClick={load}>إعادة المحاولة</button></Card2></div>;
  if (!tree) return <div className="p-8 text-center">جارٍ تحميل المنهج…</div>;

  const requestedChapterId = Number(params?.chapterId);
  const branch = tree.branches.find((item) => item.id === Number(params?.subjectId)) ?? tree.branches.find((item) => item.chapters.some((chapter) => chapter.id === requestedChapterId));
  const chapter = branch?.chapters.find((item) => item.id === requestedChapterId);
  const lectures: StudentLecture[] = chapter?.lessons.flatMap((lesson) => lesson.lectures.map((lecture) => ({ ...lecture, lesson_title: lesson.title, has_access: lesson.has_access }))) ?? [];
  const items = chapter ? lectures : (branch?.chapters ?? tree.branches);
  const title = chapter?.title ?? branch?.title ?? `منهج ${tree.grade?.name ?? "الطالب"}`;
  const open = (item: any) => chapter ? item.has_access && item.video_asset?.processing_status === "ready" ? nav("video", { lessonId: item.id }) : item.has_access ? undefined : nav("activation") : branch ? nav("lessons", { subjectId: branch.id, chapterId: item.id }) : nav("chapters", { subjectId: item.id });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          {(branch || chapter) && <button onClick={() => chapter ? nav("chapters", { subjectId: branch!.id }) : nav("subjects")} className="mb-2 flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft size={14} /> رجوع</button>}
          <h1 className="text-2xl font-black">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{tree.academic_year?.name}</p>
        </div>
        <div className={chapter ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-4 sm:grid-cols-2"}>
          {items.map((item: any) => chapter ? <LectureCard key={item.id} lecture={item} open={() => open(item)} /> : <Card2 key={item.id} className="cursor-pointer hover:border-primary" onClick={() => open(item)}><div className="flex gap-3"><BookOpen className="text-primary" /><div className="flex-1"><h2 className="font-bold">{item.title}</h2></div><ChevronLeft size={18} /></div></Card2>)}
        </div>
        {items.length === 0 && <Card2><p className="py-8 text-center text-muted-foreground">لم يُنشر محتوى لهذا المستوى بعد</p></Card2>}
      </div>
    </div>
  );
}
