import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Edit2,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  GripVertical,
  Image,
  Move,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { ApiError } from "../../shared/api/client";
import {
  loadAcademicYears,
  loadGrades,
  type AcademicYear,
  type Grade,
} from "../../shared/admin/day5";
import {
  createContent,
  createCurriculumFolder,
  deleteContent,
  deleteCurriculumFolder,
  loadCurriculum,
  loadCurriculumLocations,
  loadLectureViewers,
  moveCurriculumNode,
  renameCurriculumFolder,
  reorderContent,
  reorderCurriculumNodes,
  updateContent,
  type Branch,
  type Chapter,
  type ContentStatus,
  type Curriculum,
  type CurriculumLocation,
  type CurriculumNode,
  type Lecture,
  type LectureViewer,
  type Lesson,
  type ResourceType,
  type VideoAssetSummary,
} from "../../shared/curriculum/api";
import {
  deleteLectureThumbnail,
  uploadLectureThumbnail,
  useLectureThumbnailUrl,
} from "../../shared/media/lecture-thumbnail";
import {
  Badge2,
  Btn,
  Card2,
  Field,
  Input2,
  Modal2,
  Select2,
  notify,
} from "../../shared/ui";
import { VideoUploadModal } from "./video-upload-modal";
import { deleteVideoAsset } from "../../shared/videos/api";
import { VideoStoragePanel } from "./video-storage-panel";

type Selection = { branch?: Branch; chapter?: Chapter; lesson?: Lesson };
type ContentItem = Branch | Chapter | Lesson | Lecture;
const gradeLabel = (grade: Grade) =>
  grade.level === 1
    ? "الصف الأول الثانوي"
    : grade.level === 2
      ? "الصف الثاني الثانوي"
      : "الصف الثالث الثانوي";
const locationLabel = (name: string) => name === "Internal content storage"
  ? "محتوى داخلي محفوظ"
  : name === "Internal lecture storage"
    ? "محاضرات داخلية محفوظة"
    : name;
const formatWatchTime = (seconds: number) => `${Math.floor(seconds / 60)} دقيقة و${seconds % 60} ثانية`;
export const toLocalPublishInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};
export const scheduledLectureFields = (localValue: string, activate = true) => localValue
  ? { publish_at: new Date(localValue).toISOString(), ...(activate ? { status: "published" as const } : {}) }
  : { publish_at: null };
const isScheduled = (lecture: Lecture) => lecture.status === "published" && !!lecture.publish_at && new Date(lecture.publish_at).getTime() > Date.now();
const scheduledDateLabel = (value: string) => new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const statusLabel: Record<ContentStatus, string> = {
  draft: "مسودة",
  published: "منشور",
  hidden: "مخفي",
  archived: "مؤرشف",
};
const levelLabel: Record<ResourceType, string> = {
  branches: "مجلد",
  chapters: "مجلد",
  lessons: "مجلد",
  lectures: "محاضرة",
};
const videoStatusLabel = (status?: string) =>
  status === "ready"
    ? "الفيديو جاهز"
    : status === "failed"
      ? "فشلت المعالجة"
      : status
        ? "جارٍ تجهيز الفيديو"
        : "بدون فيديو";
const lectureVideoStatusLabel = (lecture: Lecture) =>
  lecture.video_source_type === "youtube" && lecture.youtube_video_id
    ? "فيديو YouTube جاهز"
    : videoStatusLabel(lecture.video_asset?.processing_status);
const flattenFolders = (
  nodes: CurriculumNode[],
  depth = 0,
): Array<{ node: CurriculumNode; depth: number }> =>
  nodes.flatMap((node) =>
    node.kind === "folder"
      ? [{ node, depth }, ...flattenFolders(node.children, depth + 1)]
      : [],
  );
export const descendantIds = (node: CurriculumNode): number[] => [
  node.id,
  ...(node.children ?? []).flatMap(descendantIds),
];
const childrenOf = (nodes: CurriculumNode[], parentId: number | null): CurriculumNode[] =>
  parentId === null
    ? nodes
    : flattenFolders(nodes).find(({ node }) => node.id === parentId)?.node.children ?? [];

const emptyEditor = {
  title: "",
  description: "",
  attachmentName: "",
  attachmentUrl: "",
  publishAt: "",
  isFree: false,
  additionalLessonIds: [] as number[],
};

function LectureThumbnail({ lecture }: { lecture: Lecture }) {
  const url = useLectureThumbnailUrl(lecture.id, lecture.has_thumbnail);
  return (
    <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <Image size={19} className="text-muted-foreground" />
      )}
    </div>
  );
}

function FolderTree({
  nodes,
  readOnly = false,
  depth = 0,
  onEdit,
  onEditLecture,
  onVideo,
  onPublish,
  onViewers,
  onDelete,
  onDeleteLecture,
  onAdd,
  onAddLecture,
  onMove,
  onReorder,
  onDropNode,
}: {
  nodes: CurriculumNode[];
  readOnly?: boolean;
  depth?: number;
  onEdit: (node: CurriculumNode) => void;
  onEditLecture: (node: CurriculumNode) => void;
  onVideo: (node: CurriculumNode) => void;
  onPublish: (node: CurriculumNode) => void;
  onViewers: (node: CurriculumNode) => void;
  onDelete: (node: CurriculumNode) => void;
  onDeleteLecture: (node: CurriculumNode) => void;
  onAdd: (node: CurriculumNode) => void;
  onAddLecture: (node: CurriculumNode) => void;
  onMove: (node: CurriculumNode) => void;
  onDropNode: (sourceId: number, parentId: number | null, beforeId?: number) => void;
  onReorder: (
    nodes: CurriculumNode[],
    index: number,
    direction: -1 | 1,
  ) => void;
}) {
  return (
    <div className="space-y-2">
      {nodes.map((node, index) => (
        <div
          key={node.id}
          className={depth ? "mr-5 border-r border-border pr-3" : ""}
        >
          {!readOnly && <div
            aria-label={`ضع العنصر قبل ${node.title}`}
            className="my-1 h-2 rounded-full transition-colors hover:bg-primary/40"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const sourceId = Number(event.dataTransfer.getData("text/plain"));
              if (sourceId) onDropNode(sourceId, node.parent_id ?? null, node.id);
            }}
          />}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
            {!readOnly && <span
              draggable
              role="button"
              tabIndex={0}
              title="اسحب لترتيب العنصر، أو استخدم زر نقل وترتيب"
              aria-label={`اسحب ${node.title} لنقله`}
              className="cursor-grab rounded-lg p-1 text-muted-foreground active:cursor-grabbing"
              onDragStart={(event) => event.dataTransfer.setData("text/plain", String(node.id))}
            >
              <GripVertical size={18} />
            </span>}
            {!readOnly && <div className="flex flex-col">
              <button
                type="button"
                aria-label="تحريك لأعلى"
                disabled={index === 0}
                onClick={() => onReorder(nodes, index, -1)}
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                aria-label="تحريك لأسفل"
                disabled={index === nodes.length - 1}
                onClick={() => onReorder(nodes, index, 1)}
              >
                <ChevronDown size={16} />
              </button>
            </div>}
            {node.kind === "folder" ? (
              <FolderOpen className="text-primary" />
            ) : (
              <BookOpen className="text-primary" />
            )}
            <div className="min-w-40 flex-1">
              <strong>{node.title}</strong>
              <p className="text-xs text-muted-foreground">
                {node.kind === "folder"
                  ? `${node.children.length} عنصر داخل المجلد`
                  : node.lecture && isScheduled(node.lecture)
                    ? `مجدولة للنشر ${scheduledDateLabel(node.lecture.publish_at!)}`
                    : `محاضرة — ${node.lecture ? statusLabel[node.lecture.status] : ""}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {node.kind === "folder" ? (!readOnly && (
                <>
                  <button
                    type="button"
                    title="إضافة مجلد بالداخل"
                    className="curriculum-action"
                    onClick={() => onAdd(node)}
                  >
                    <Folder size={16} /> مجلد داخلي
                  </button>
                  <button
                    type="button"
                    title="إضافة محاضرة بالداخل"
                    className="curriculum-action"
                    onClick={() => onAddLecture(node)}
                  >
                    <Plus size={16} /> محاضرة
                  </button>
                  <button
                    type="button"
                    title="تعديل الاسم"
                    className="curriculum-action"
                    onClick={() => onEdit(node)}
                  >
                    <Edit2 size={16} /> تعديل الاسم
                  </button>
                  <button
                    type="button"
                    title="نقل المجلد أو تغيير ترتيبه"
                    aria-label={`نقل وترتيب ${node.title}`}
                    onClick={() => onMove(node)}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/40 px-2 py-1 text-sm font-bold text-primary hover:bg-primary/10"
                  >
                    <Move size={16} /> نقل وترتيب
                  </button>
                  <button
                    type="button"
                    title="حذف المجلد مع إبقاء محتواه"
                    className="curriculum-action"
                    onClick={() => onDelete(node)}
                  >
                    <Trash2 size={16} className="text-red-500" /> حذف
                  </button>
                </>
                )) : (
                <>
                  {!readOnly && <button type="button" title="تعديل المحاضرة" className="curriculum-action" onClick={() => onEditLecture(node)}><Edit2 size={16} /> تعديل المحاضرة</button>}
                  <button type="button" title="متابعة مشاهدة الطلاب" aria-label={`متابعة مشاهدة الطلاب في ${node.title}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-sm text-primary hover:bg-primary/10" onClick={() => onViewers(node)}><Eye size={16} /> متابعة المشاهدة</button>
                  {!readOnly && <button type="button" title="إدارة فيديو المحاضرة" className="curriculum-action" onClick={() => onVideo(node)}><Upload size={16} /> الفيديو</button>}
                  {!readOnly && <button type="button" title="نشر المحاضرة" className="curriculum-action" onClick={() => onPublish(node)}><BookOpen size={16} /> نشر</button>}
                  {!readOnly && <button type="button" title="نقل المحاضرة أو تغيير ترتيبها" aria-label={`نقل وترتيب ${node.title}`} onClick={() => onMove(node)} className="inline-flex items-center gap-1 rounded-lg border border-primary/40 px-2 py-1 text-sm font-bold text-primary hover:bg-primary/10"><Move size={16} /> نقل وترتيب</button>}
                  {!readOnly && <button type="button" title="حذف المحاضرة" className="curriculum-action" onClick={() => onDeleteLecture(node)}><Trash2 size={16} className="text-red-500" /> حذف</button>}
                </>
              )}
            </div>
          </div>
          {!readOnly && node.kind === "folder" && (
            <div
              className="my-1 mr-4 rounded-lg border border-dashed border-border px-3 py-1 text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const sourceId = Number(event.dataTransfer.getData("text/plain"));
                if (sourceId) onDropNode(sourceId, node.id);
              }}
            >
              اسحب محاضرة أو مجلدًا إلى هنا لوضعه داخل «{node.title}»
            </div>
          )}
          {node.kind === "folder" && node.children.length > 0 && (
            <div className="mt-2">
              <FolderTree
                nodes={node.children}
                readOnly={readOnly}
                depth={depth + 1}
                onEdit={onEdit}
                onEditLecture={onEditLecture}
                onVideo={onVideo}
                onPublish={onPublish}
                onViewers={onViewers}
                onDelete={onDelete}
                onDeleteLecture={onDeleteLecture}
                onAdd={onAdd}
                onAddLecture={onAddLecture}
                onMove={onMove}
                onReorder={onReorder}
                onDropNode={onDropNode}
              />
            </div>
          )}
        </div>
      ))}
      {!readOnly && <div
        className="h-3 rounded-full transition-colors hover:bg-primary/40"
        aria-label="ضع العنصر في نهاية هذا المستوى"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const sourceId = Number(event.dataTransfer.getData("text/plain"));
          if (sourceId) onDropNode(sourceId, nodes[0]?.parent_id ?? null);
        }}
      />}
    </div>
  );
}
export function CurriculumManagePage({ params, nav, authUser }: any) {
  const readOnly = authUser?.role === "assistant";
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [yearId, setYearId] = useState(0);
  const [gradeId, setGradeId] = useState(0);
  const [tree, setTree] = useState<Curriculum | null>(null);
  const [locations, setLocations] = useState<CurriculumLocation[]>([]);
  const [selection, setSelection] = useState<Selection>({});
  const [modal, setModal] = useState(false);
  const [editor, setEditor] = useState(emptyEditor);
  const publishAtInputRef = useRef<HTMLInputElement>(null);
  const updatePublishAt = (value: string) => setEditor((current) => ({ ...current, publishAt: value }));
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [folderModal, setFolderModal] = useState(false);
  const [folderTitle, setFolderTitle] = useState("");
  const [folderParentId, setFolderParentId] = useState<number | null>(null);
  const [folderEditing, setFolderEditing] = useState<CurriculumNode | null>(
    null,
  );
  const [movingNode, setMovingNode] = useState<CurriculumNode | null>(null);
  const [moveParentId, setMoveParentId] = useState<number | null>(null);
  const [moveBeforeId, setMoveBeforeId] = useState<number | null>(null);
  const [moveSaving, setMoveSaving] = useState(false);
  const [lectureParentNodeId, setLectureParentNodeId] = useState<number | null>(
    null,
  );
  const [directLecture, setDirectLecture] = useState(false);
  const [uploadLecture, setUploadLecture] = useState<{
    id: number;
    title: string;
    video_source_type?: "uploaded" | "youtube";
    youtube_video_id?: string | null;
    video_asset?: VideoAssetSummary | null;
  } | null>(null);
  const [viewerLecture, setViewerLecture] = useState<CurriculumNode | null>(null);
  const [viewers, setViewers] = useState<LectureViewer[]>([]);
  const [viewersPage, setViewersPage] = useState(1);
  const [viewersTotalPages, setViewersTotalPages] = useState(1);
  const [viewersLoading, setViewersLoading] = useState(false);
  const [viewerQuery, setViewerQuery] = useState("");
  const [viewerStatus, setViewerStatus] = useState("");
  const [expandedViewerId, setExpandedViewerId] = useState<number | null>(null);
  const level: ResourceType = selection.lesson
    ? "lectures"
    : selection.chapter
      ? "lessons"
      : selection.branch
        ? "chapters"
        : "branches";
  const items: ContentItem[] =
    selection.lesson?.lectures ??
    selection.chapter?.lessons ??
    selection.branch?.chapters ??
    tree?.branches ??
    [];

  const refresh = useCallback(async () => {
    if (!yearId || !gradeId) return;
    try {
      const response = await loadCurriculum({
        academicYearId: yearId,
        gradeId,
      });
      setTree(response.curriculum);
      setSelection((current) => {
        const branch = response.curriculum.branches.find(
          (item) => item.id === current.branch?.id,
        );
        const chapter = branch?.chapters.find(
          (item) => item.id === current.chapter?.id,
        );
        const lesson = chapter?.lessons.find(
          (item) => item.id === current.lesson?.id,
        );
        return { branch, chapter, lesson };
      });
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "تعذر تحميل المحتوى",
        "error",
      );
    }
  }, [yearId, gradeId]);

  useEffect(() => {
    Promise.all([loadAcademicYears(), loadGrades()]).then(
      ([yearData, gradeData]) => {
        setYears(yearData.academic_years);
        setGrades(gradeData.grades);
        setYearId(
          Number(params?.yearId) ||
            (yearData.academic_years.find((year) => year.status === "active")
              ?.id ??
              yearData.academic_years[0]?.id ??
              0),
        );
        setGradeId(Number(params?.gradeId) || (gradeData.grades[0]?.id ?? 0));
      },
    );
  }, []);
  useEffect(() => {
    loadCurriculumLocations()
      .then((response) => setLocations(response.locations))
      .catch(() => setLocations([]));
  }, []);
  useEffect(() => {
    setSelection({});
    void refresh();
  }, [yearId, gradeId, refresh]);

  const parentInput = (): Record<string, number> =>
    level === "branches"
      ? { academic_year_id: yearId, grade_id: gradeId }
      : level === "chapters"
        ? { branch_id: selection.branch!.id }
        : level === "lessons"
          ? { chapter_id: selection.chapter!.id }
          : { lesson_id: selection.lesson!.id };
  const openEditor = (item?: ContentItem) => {
    setDirectLecture(false);
    const lecture = level === "lectures" && item ? (item as Lecture) : null;
    setEditing(item ?? null);
    setEditor(
      item
        ? {
            title: item.title,
            description: lecture?.description ?? "",
            attachmentName: lecture?.attachment_name ?? "",
            attachmentUrl: lecture?.attachment_url ?? "",
            publishAt: toLocalPublishInput(item.publish_at),
            isFree: lecture?.is_free ?? false,
            additionalLessonIds: lecture?.additional_lesson_ids ?? [],
          }
        : emptyEditor,
    );
    setThumbnailFile(null);
    setRemoveThumbnail(false);
    setModal(true);
  };
  const openFolderEditor = (
    parent: CurriculumNode | null = null,
    item: CurriculumNode | null = null,
  ) => {
    setFolderParentId(parent?.id ?? item?.parent_id ?? null);
    setFolderEditing(item);
    setFolderTitle(item?.title ?? "");
    setFolderModal(true);
  };
  const saveFolder = async () => {
    if (!selection.branch || !folderTitle.trim()) return;
    setSaving(true);
    try {
      if (folderEditing)
        await renameCurriculumFolder(
          selection.branch.id,
          folderEditing.id,
          folderTitle.trim(),
        );
      else
        await createCurriculumFolder(
          selection.branch.id,
          folderParentId,
          folderTitle.trim(),
        );
      setFolderModal(false);
      await refresh();
      notify(
        folderEditing ? "تم تعديل اسم المجلد" : "تم إنشاء مجلد واحد",
        "success",
      );
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "تعذر حفظ المجلد",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };
  const openDirectLectureEditor = async (
    parentNodeId: number | null = null,
  ) => {
    if (!selection.branch) return;
    const chapter = selection.branch.chapters[0];
    const lesson = chapter?.lessons[0];
    setDirectLecture(true);
    setLectureParentNodeId(parentNodeId);
    setSelection({ branch: selection.branch, chapter, lesson });
    setEditing(null);
    setEditor(emptyEditor);
    setThumbnailFile(null);
    setRemoveThumbnail(false);
    setModal(true);
  };
  const editTreeLecture = (node: CurriculumNode) => {
    if (!selection.branch || !node.lecture) return;
    const lecture = node.lecture;
    setDirectLecture(true);
    setLectureParentNodeId(node.parent_id ?? null);
    setEditing(lecture);
    setEditor({
      title: lecture.title,
      description: lecture.description ?? "",
      attachmentName: lecture.attachment_name ?? "",
      attachmentUrl: lecture.attachment_url ?? "",
      publishAt: toLocalPublishInput(lecture.publish_at),
      isFree: lecture.is_free ?? false,
      additionalLessonIds: lecture.additional_lesson_ids ?? [],
    });
    setThumbnailFile(null);
    setRemoveThumbnail(false);
    setModal(true);
  };
  const save = async () => {
    setSaving(true);
    try {
      const effectiveLevel: ResourceType = directLecture ? "lectures" : level;
      const publishAtValue = publishAtInputRef.current?.value ?? editor.publishAt;
      const lectureFields =
        effectiveLevel === "lectures"
          ? {
              description: editor.description || null,
              attachment_name: editor.attachmentName || null,
              attachment_url: editor.attachmentUrl || null,
              ...scheduledLectureFields(publishAtValue, !editing || editing.status === "draft" || toLocalPublishInput(editing.publish_at) !== publishAtValue),
              is_free: editor.isFree,
              additional_lesson_ids: editor.additionalLessonIds,
            }
          : {};
      const payload = { title: editor.title, ...lectureFields };
      const nodePlacement =
        effectiveLevel === "lectures" && !editing && selection.branch
          ? {
              branch_id: selection.branch.id,
              parent_node_id: lectureParentNodeId,
            }
          : {};
      const legacyParent =
        effectiveLevel === "lectures" && selection.lesson
          ? { lesson_id: selection.lesson.id }
          : effectiveLevel === "lectures"
            ? {}
            : parentInput();
      const response = editing
        ? await updateContent(effectiveLevel, editing.id, payload)
        : await createContent(effectiveLevel, {
            ...legacyParent,
            ...nodePlacement,
            ...payload,
            status: publishAtValue ? "published" : "draft",
          });
      const createdLecture = (response as { lecture?: Lecture }).lecture;
      const recordId = editing?.id ?? createdLecture?.id;
      if (effectiveLevel === "lectures" && recordId) {
        if (removeThumbnail) await deleteLectureThumbnail(recordId);
        if (thumbnailFile)
          await uploadLectureThumbnail(recordId, thumbnailFile);
      }
      setModal(false);
      setDirectLecture(false);
      await refresh();
      setSelection((current) => ({ branch: current.branch }));
      if (effectiveLevel === "lectures" && !editing && createdLecture) {
        setUploadLecture({
          id: createdLecture.id,
          title: createdLecture.title,
          video_source_type: createdLecture.video_source_type,
          youtube_video_id: createdLecture.youtube_video_id,
          video_asset: createdLecture.video_asset,
        });
        notify("تم إنشاء المحاضرة. اختر الآن مصدر الفيديو واحفظه", "success");
      } else
        notify(
          editing ? effectiveLevel === "lectures" ? "تم حفظ تعديلات المحاضرة" : "تم حفظ تعديلات المجلد" : "تمت إضافة المحتوى",
          "success",
        );
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "تعذر حفظ المحتوى",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };
  const deleteFolder = async (node: CurriculumNode) => {
    if (
      !selection.branch ||
      !window.confirm("سيُحذف المجلد فقط، وستُنقل كل المجلدات والمحاضرات الموجودة بداخله إلى المستوى الأعلى دون حذفها. هل تريد الاستمرار؟")
    )
      return;
    try {
      await deleteCurriculumFolder(selection.branch.id, node.id);
      await refresh();
      notify("تم حذف المجلد ونقل محتواه إلى المستوى الأعلى", "success");
    } catch (error) {
      notify(
        error instanceof ApiError
          ? error.message
          : "تعذر حذف المجلد",
        "error",
      );
    }
  };
  const openLectureViewers = (node: CurriculumNode, page = 1) => {
    if (!node.lecture_id) return;
    if (viewerLecture?.lecture_id !== node.lecture_id) { setViewerQuery(""); setViewerStatus(""); setExpandedViewerId(null); }
    setViewerLecture(node);
    setViewersPage(page);
  };
  useEffect(() => {
    if (!viewerLecture?.lecture_id) return;
    let current = true;
    setViewersLoading(true);
    const timer = setTimeout(() => {
      loadLectureViewers(viewerLecture.lecture_id!, viewersPage, viewerQuery, viewerStatus)
        .then(response => { if (current) { setViewers(response.viewers); setViewersTotalPages(response.pagination.total_pages || 1); } })
        .catch(error => { if (current) notify(error instanceof ApiError ? error.message : "تعذر تحميل متابعة المحاضرة", "error"); })
        .finally(() => { if (current) setViewersLoading(false); });
    }, viewerQuery ? 250 : 0);
    return () => { current = false; clearTimeout(timer); };
  }, [viewerLecture, viewersPage, viewerQuery, viewerStatus]);
  const deleteTreeLecture = async (node: CurriculumNode) => {
    if (
      !node.lecture_id ||
      !window.confirm(
        "سيتم حذف المحاضرة من المنصة مع الاحتفاظ بملف الفيديو في المكتبة. هل تريد الاستمرار؟",
      )
    )
      return;
    try {
      await deleteContent("lectures", node.lecture_id);
      await refresh();
      notify("تم حذف المحاضرة", "success");
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "تعذر حذف المحاضرة",
        "error",
      );
    }
  };
  const manageTreeLectureVideo = (node: CurriculumNode) => {
    if (!node.lecture) return;
    const lecture = node.lecture;
    setUploadLecture({
      id: lecture.id,
      title: lecture.title,
      video_source_type: lecture.video_source_type,
      youtube_video_id: lecture.youtube_video_id,
      video_asset: lecture.video_asset,
    });
  };
  const publishTreeLecture = async (node: CurriculumNode) => {
    if (!node.lecture_id) return;
    try {
      await updateContent("lectures", node.lecture_id, { status: "published" });
      await refresh();
      notify("تم نشر المحاضرة", "success");
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "تعذر نشر المحاضرة",
        "error",
      );
    }
  };
  const openMoveNode = (node: CurriculumNode) => {
    setMovingNode(node);
    setMoveParentId(node.parent_id ?? null);
    setMoveBeforeId(null);
  };
  const moveNode = async () => {
    if (!selection.branch || !movingNode) return;
    setMoveSaving(true);
    try {
      await moveCurriculumNode(
        selection.branch.id,
        movingNode.id,
        moveParentId,
        moveBeforeId ?? undefined,
      );
      setMovingNode(null);
      await refresh();
      notify("تم حفظ المكان والترتيب دون تغيير محتوى المحاضرة", "success");
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "تعذر نقل العنصر",
        "error",
      );
    } finally {
      setMoveSaving(false);
    }
  };
  const dropNode = async (
    sourceId: number,
    parentId: number | null,
    beforeId?: number,
  ) => {
    if (!selection.branch || sourceId === beforeId) return;
    try {
      await moveCurriculumNode(selection.branch.id, sourceId, parentId, beforeId);
      await refresh();
      notify("تم نقل العنصر وترتيبه", "success");
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "تعذر نقل العنصر",
        "error",
      );
    }
  };
  const reorderNodes = async (
    nodes: CurriculumNode[],
    index: number,
    direction: -1 | 1,
  ) => {
    if (!selection.branch) return;
    const target = index + direction;
    if (target < 0 || target >= nodes.length) return;
    const ids = nodes.map((node) => node.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorderCurriculumNodes(
        selection.branch.id,
        nodes[0]?.parent_id ?? null,
        ids,
      );
      await refresh();
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "تعذر إعادة الترتيب",
        "error",
      );
    }
  };
  const changeStatus = async (id: number, status: ContentStatus) => {
    await updateContent(level, id, { status });
    await refresh();
    notify("تم تحديث حالة النشر", "success");
  };
  const remove = async (id: number) => {
    const warning =
      level === "lectures"
        ? "سيتم حذف المحاضرة من المنصة مع الاحتفاظ بملف الفيديو في المكتبة والتخزين السحابي. هل تريد الاستمرار؟"
        : `سيتم حذف ${levelLabel[level]}. هل تريد الاستمرار؟`;
    if (!window.confirm(warning)) return;
    try {
      await deleteContent(level, id);
      await refresh();
      notify(`تم حذف ${levelLabel[level]}`, "success");
    } catch (error) {
      notify(
        error instanceof ApiError && error.status === 409
          ? `لا يمكن حذف ${levelLabel[level]} قبل إزالة المحتوى والسجلات المرتبطة به`
          : `تعذر حذف ${levelLabel[level]}`,
        "error",
      );
    }
  };
  const removeMainFolder = async () => {
    if (!selection.branch) return;
    if (!window.confirm("سيُحذف المجلد الرئيسي إذا كان فارغًا فقط. لن تُحذف محاضرات أو واجبات أو اختبارات أو سجلات الطلاب تلقائيًا. هل تريد الاستمرار؟")) return;
    try {
      await deleteContent("branches", selection.branch.id);
      setSelection({});
      await refresh();
      notify("تم حذف المجلد الرئيسي الفارغ", "success");
    } catch (error) {
      notify(error instanceof ApiError && error.status === 409
        ? "المجلد الرئيسي مرتبط بمحتوى أو واجبات أو اختبارات. أرشفه لإخفائه بأمان، أو انقل محتواه أولًا قبل الحذف."
        : "تعذر حذف المجلد الرئيسي", "error");
    }
  };
  const removeLectureVideo = async (lecture: Lecture) => {
    if (!lecture.video_asset) return;
    if (
      !window.confirm(
        "سيتم حذف ملف الفيديو فقط من التخزين السحابي بكل جوداته، وستظل المحاضرة موجودة. لا يمكن التراجع. هل تريد الاستمرار؟",
      )
    )
      return;
    try {
      await deleteVideoAsset(lecture.video_asset.id);
      await refresh();
      notify("تم حذف ملف الفيديو فقط، والمحاضرة ما زالت موجودة", "success");
    } catch (error) {
      notify(
        error instanceof ApiError && error.status === 422
          ? "هذا الفيديو مستخدم في محاضرة أخرى؛ أزل استخدامه منها أولًا"
          : error instanceof ApiError
            ? error.message
            : "تعذر حذف ملف الفيديو",
        "error",
      );
    }
  };
  const move = async (id: number, direction: -1 | 1) => {
    const index = items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const ids = items.map((item) => item.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await reorderContent(level, parentInput(), ids);
    await refresh();
  };
  const enter = (item: ContentItem) =>
    setSelection((current) =>
      level === "branches"
        ? { branch: item as Branch }
        : level === "chapters"
          ? { ...current, chapter: item as Chapter }
          : level === "lessons"
            ? { ...current, lesson: item as Lesson }
            : current,
    );
  const back = () =>
    setSelection((current) =>
      current.lesson
        ? { branch: current.branch, chapter: current.chapter }
        : current.chapter
          ? { branch: current.branch }
          : {},
    );
  const heading =
    selection.lesson?.title ??
    selection.chapter?.title ??
    selection.branch?.title ??
    "إدارة المحتوى";
  const branchTreeMode = Boolean(selection.branch && !selection.chapter);
  const closeLectureModal = () => {
    setModal(false);
    setDirectLecture(false);
    setLectureParentNodeId(null);
    if (selection.branch) setSelection({ branch: selection.branch });
  };

  return (
    <div className="workspace content-workspace min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            {selection.branch && (
              <button
                onClick={back}
                className="mb-2 flex items-center gap-1 text-sm text-muted-foreground"
              >
                <ChevronLeft size={14} /> رجوع
              </button>
            )}
            <h1 className="text-2xl font-black">{heading}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {readOnly ? "تصفح المجلدات والمحاضرات، وافتح متابعة المشاهدة لمعرفة تقدم الطلاب." : "أنشئ مجلدًا أو محاضرة، ثم استخدم «نقل وترتيب» لاختيار مكانها بسهولة. ويمكنك أيضًا السحب للترتيب السريع."}
            </p>
          </div>
          {!readOnly && <div className="flex flex-wrap justify-end gap-2">
            {branchTreeMode ? (
              <>
                <Btn variant="outline" onClick={removeMainFolder}>
                  <Trash2 size={15} /> حذف المجلد الرئيسي
                </Btn>
                <Btn
                  disabled={saving}
                  onClick={() => openDirectLectureEditor(null)}
                >
                  <Plus size={15} /> إضافة محاضرة
                </Btn>
                <Btn variant="outline" onClick={() => openFolderEditor()}>
                  <Folder size={15} /> إضافة مجلد
                </Btn>
              </>
            ) : (
              <Btn onClick={() => openEditor()}>
                <Plus size={15} /> إضافة {levelLabel[level]}
              </Btn>
            )}
          </div>}
        </div>
        <Card2 className="mb-4">
          <Select2
            label="السنة الدراسية"
            value={String(yearId)}
            onChange={(event: any) => setYearId(Number(event.target.value))}
            options={years.map((year) => ({
              value: String(year.id),
              label: year.name,
            }))}
          />
          <div className="mt-4">
            <p className="mb-2 text-sm font-bold">
              اختر الصف ثم أدِر مجلداته ومحاضراته
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {grades.map((grade) => (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => setGradeId(grade.id)}
                  className={`rounded-2xl border p-4 text-right transition ${gradeId === grade.id ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-background hover:border-primary/60"}`}
                >
                  <BookOpen className="mb-3" size={22} />
                  <strong>{gradeLabel(grade)}</strong>
                  <span className="mt-1 block text-xs opacity-80">
                    النحو والبلاغة والأدب وباقي الفروع
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card2>
        {!readOnly && <VideoStoragePanel onChange={refresh} />}
        {branchTreeMode ? (
          <div className="space-y-3">
            {!readOnly && <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              <strong>تريد تغيير مكان عنصر؟</strong> اضغط «نقل وترتيب» بجانبه، اختر المجلد ثم موضعه، واضغط «حفظ المكان». الأسهم الصغيرة تغيّر ترتيبه داخل نفس المجلد فقط.
            </div>}
            {selection.branch?.nodes?.length ? (
              <FolderTree
                nodes={selection.branch.nodes}
                readOnly={readOnly}
                onEdit={(node) => openFolderEditor(null, node)}
                onEditLecture={editTreeLecture}
                onVideo={manageTreeLectureVideo}
                onPublish={publishTreeLecture}
                onViewers={openLectureViewers}
                onDelete={deleteFolder}
                onDeleteLecture={deleteTreeLecture}
                onAdd={(node) => openFolderEditor(node)}
                onAddLecture={(node) => openDirectLectureEditor(node.id)}
                onMove={openMoveNode}
                onReorder={reorderNodes}
                onDropNode={dropNode}
              />
            ) : (
              <Card2>
                <p className="py-8 text-center text-muted-foreground">
                  {readOnly ? "لا يوجد محتوى في هذا الفرع حتى الآن." : "لا يوجد محتوى بعد. أضف مجلدًا أو محاضرة."}
                </p>
              </Card2>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const lecture = level === "lectures" ? (item as Lecture) : null;
              return (
                <Card2 key={item.id}>
                  <div className="flex flex-wrap items-center gap-3">
                    {!readOnly && <div className="flex flex-col">
                      <button
                        aria-label="تحريك لأعلى"
                        disabled={index === 0}
                        onClick={() => move(item.id, -1)}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        aria-label="تحريك لأسفل"
                        disabled={index === items.length - 1}
                        onClick={() => move(item.id, 1)}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>}
                    {lecture ? (
                      <LectureThumbnail lecture={lecture} />
                    ) : (
                      <BookOpen className="text-primary" />
                    )}
                    <button
                      className="min-w-48 flex-1 text-right"
                      onClick={() => enter(item)}
                    >
                      <strong>{item.title}</strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge2
                          variant={
                            item.status === "published" ? "success" : "default"
                          }
                        >
                          {statusLabel[item.status]}
                        </Badge2>
                        {lecture && (
                          <>
                            <Badge2
                              variant={
                                (lecture.video_source_type === "youtube" &&
                                  lecture.youtube_video_id) ||
                                lecture.video_asset?.processing_status ===
                                  "ready"
                                  ? "success"
                                  : "default"
                              }
                            >
                              {lectureVideoStatusLabel(lecture)}
                            </Badge2>
                            {lecture.is_free && (
                              <Badge2 variant="info">مجانية</Badge2>
                            )}
                          </>
                        )}
                      </div>
                      {lecture?.description && (
                        <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                          {lecture.description}
                        </p>
                      )}
                    </button>
                    <div className="flex flex-wrap gap-2">
                      {lecture && <Btn size="sm" variant="outline" onClick={() => void openLectureViewers({ id: lecture.id, lecture_id: lecture.id, kind: "lecture", title: lecture.title } as CurriculumNode)}><Eye size={14} /> متابعة المشاهدة</Btn>}
                      {!readOnly && <>
                      {lecture && (
                        <>
                          <Btn
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setUploadLecture({
                                id: lecture.id,
                                title: lecture.title,
                                video_source_type: lecture.video_source_type,
                                youtube_video_id: lecture.youtube_video_id,
                                video_asset: lecture.video_asset,
                              })
                            }
                          >
                            <Upload size={14} /> إدارة الفيديو
                          </Btn>
                          {lecture.video_asset && (
                            <Btn
                              size="sm"
                              variant="danger"
                              onClick={() => removeLectureVideo(lecture)}
                            >
                              <Trash2 size={14} /> حذف الفيديو فقط
                            </Btn>
                          )}
                        </>
                      )}
                      <button title="تعديل" onClick={() => openEditor(item)}>
                        <Edit2 size={16} />
                      </button>
                      <button
                        title="نشر"
                        onClick={() => changeStatus(item.id, "published")}
                      >
                        <BookOpen size={16} />
                      </button>
                      <button
                        title="إخفاء"
                        onClick={() => changeStatus(item.id, "hidden")}
                      >
                        <EyeOff size={16} />
                      </button>
                      <button
                        title="أرشفة"
                        onClick={() => changeStatus(item.id, "archived")}
                      >
                        <Archive size={16} />
                      </button>
                      <button
                        title={`حذف ${levelLabel[level]} نفسه`}
                        aria-label={`حذف ${levelLabel[level]} نفسه`}
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                      </>}
                    </div>
                  </div>
                </Card2>
              );
            })}
            {items.length === 0 && (
              <Card2>
                <p className="py-8 text-center text-muted-foreground">
                  لا يوجد محتوى في هذا المستوى
                </p>
              </Card2>
            )}
          </div>
        )}
        <Modal2
          open={modal}
          onClose={closeLectureModal}
          title={
            editing
              ? `تعديل ${levelLabel[directLecture ? "lectures" : level]}`
              : `إضافة ${levelLabel[directLecture ? "lectures" : level]}`
          }
          size={directLecture || level === "lectures" ? "lg" : "md"}
          onSubmit={save}
        >
          <div className="space-y-4">
            <Input2
              label="العنوان"
              value={editor.title}
              onChange={(event) =>
                setEditor((value) => ({ ...value, title: event.target.value }))
              }
            />
            {(directLecture || level === "lectures") && (
              <>
                <Field label="وصف المحاضرة">
                  <textarea
                    rows={4}
                    value={editor.description}
                    onChange={(event) =>
                      setEditor((value) => ({
                        ...value,
                        description: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm"
                    placeholder="اكتب ما سيتعلمه الطالب في هذه المحاضرة"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input2
                    label="اسم الملف المرفق"
                    value={editor.attachmentName}
                    onChange={(event) =>
                      setEditor((value) => ({
                        ...value,
                        attachmentName: event.target.value,
                      }))
                    }
                    placeholder="مذكرة المحاضرة"
                  />
                  <Input2
                    label="رابط الملف المرفق"
                    type="url"
                    dir="ltr"
                    value={editor.attachmentUrl}
                    onChange={(event) =>
                      setEditor((value) => ({
                        ...value,
                        attachmentUrl: event.target.value,
                      }))
                    }
                    placeholder="رابط الملف"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="موعد النشر (اختياري)" htmlFor="lecture-publish-at">
                    <input
                      id="lecture-publish-at"
                      type="datetime-local"
                      ref={publishAtInputRef}
                      className="block min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={editor.publishAt}
                      onChange={(event) => updatePublishAt(event.target.value)}
                      onInput={(event) => updatePublishAt(event.currentTarget.value)}
                      onBlur={(event) => updatePublishAt(event.currentTarget.value)}
                    />
                  </Field>
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    عند تحديد موعد، تُجدول المحاضرة تلقائيًا: لن تظهر للطلاب قبله، وستظهر بعده بتوقيت جهازك. تأكد أن المجلد الرئيسي منشور وأن الفيديو جاهز.
                  </p>
                  <label className="flex items-center gap-2 self-end rounded-xl border border-border p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={editor.isFree}
                      onChange={(event) =>
                        setEditor((value) => ({
                          ...value,
                          isFree: event.target.checked,
                        }))
                      }
                    />{" "}
                    محاضرة مجانية
                  </label>
                </div>
                <Field label="أماكن إضافية للمحاضرة">
                  <p className="mb-2 text-xs text-muted-foreground">
                    اختر أي دروس أخرى تريد أن تظهر فيها المحاضرة نفسها. لن يُرفع
                    الفيديو أو يُعالج مرة أخرى.
                  </p>
                  <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
                    {locations
                      .filter(
                        (location) =>
                          location.lesson_id !== selection.lesson?.id,
                      )
                      .map((location) => (
                        <label
                          key={location.lesson_id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={editor.additionalLessonIds.includes(
                              location.lesson_id,
                            )}
                            onChange={(event) =>
                              setEditor((value) => ({
                                ...value,
                                additionalLessonIds: event.target.checked
                                  ? [
                                      ...value.additionalLessonIds,
                                      location.lesson_id,
                                    ]
                                  : value.additionalLessonIds.filter(
                                      (id) => id !== location.lesson_id,
                                    ),
                              }))
                            }
                          />
                          <span>
                            <strong>
                              {location.academic_year} —{" "}
                              {gradeLabel({
                                id: 0,
                                name: location.grade,
                                level: location.grade_level,
                              })}
                            </strong>
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {locationLabel(location.branch)} / {locationLabel(location.chapter)} /{" "}
                              {locationLabel(location.lesson)}
                            </span>
                          </span>
                        </label>
                      ))}
                  </div>
                </Field>
                <Field label="صورة المحاضرة">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      setThumbnailFile(event.target.files?.[0] ?? null);
                      setRemoveThumbnail(false);
                    }}
                    className="block w-full rounded-xl border border-border bg-background p-3 text-sm"
                  />
                  {editing && (editing as Lecture).has_thumbnail && (
                    <label className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <input
                        type="checkbox"
                        checked={removeThumbnail}
                        onChange={(event) => {
                          setRemoveThumbnail(event.target.checked);
                          if (event.target.checked) setThumbnailFile(null);
                        }}
                      />{" "}
                      حذف الصورة الحالية
                    </label>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    الأبعاد الموصى بها: ١٢٨٠ × ٧٢٠ بكسل بنسبة ١٦:٩.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    صورة بصيغة جيه بي جي أو بي إن جي أو ويب بي، بحد أقصى ٥ ميجابايت.
                  </p>
                </Field>
              </>
            )}
            <Btn
              type="submit"
              className="w-full"
              disabled={!editor.title.trim() || saving}
            >
              {saving
                ? "جارٍ الحفظ…"
                : editing
                  ? "حفظ التعديلات"
                  : editor.publishAt
                    ? new Date(editor.publishAt).getTime() > Date.now()
                      ? "جدولة المحاضرة"
                      : "نشر المحاضرة الآن"
                    : "حفظ كمسودة"}
            </Btn>
          </div>
        </Modal2>
        <Modal2
          open={folderModal}
          onClose={() => setFolderModal(false)}
          title={folderEditing ? "تعديل اسم المجلد" : "إضافة مجلد"}
          onSubmit={saveFolder}
        >
          <div className="space-y-4">
            <Input2
              label="اسم المجلد"
              value={folderTitle}
              onChange={(event) => setFolderTitle(event.target.value)}
              autoFocus
            />
            <Btn
              type="submit"
              className="w-full"
              disabled={!folderTitle.trim() || saving}
            >
              {saving
                ? "جارٍ الحفظ…"
                : folderEditing
                  ? "حفظ الاسم"
                  : "إنشاء المجلد"}
            </Btn>
          </div>
        </Modal2>
        <Modal2
          open={Boolean(movingNode)}
          onClose={() => setMovingNode(null)}
          title="نقل وترتيب العنصر"
          size="lg"
        >
          <div className="space-y-4">
            <p className="rounded-xl bg-muted p-3 text-sm">
              ستنقل <strong>«{movingNode?.title}»</strong> داخل هذا الفرع فقط. الفيديو والبيانات لن يتغيرا.
            </p>
            <div>
              <p className="mb-2 font-bold">١. اختر المكان الجديد</p>
              <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
                <button
                  type="button"
                  aria-pressed={moveParentId === null}
                  onClick={() => { setMoveParentId(null); setMoveBeforeId(null); }}
                  className={`flex w-full items-center gap-2 rounded-xl border p-3 text-right ${moveParentId === null ? "border-primary bg-primary/10 font-bold" : "border-border hover:border-primary"}`}
                >
                  <FolderOpen size={18} /> خارج المجلدات، في صفحة الفرع مباشرة
                </button>
                {flattenFolders(selection.branch?.nodes ?? [])
                  .filter(({ node }) => !new Set(movingNode ? descendantIds(movingNode) : []).has(node.id))
                  .map(({ node, depth }) => (
                    <button
                      key={node.id}
                      type="button"
                      aria-pressed={moveParentId === node.id}
                      onClick={() => { setMoveParentId(node.id); setMoveBeforeId(null); }}
                      className={`flex w-full items-center gap-2 rounded-xl border p-3 text-right ${moveParentId === node.id ? "border-primary bg-primary/10 font-bold" : "border-border hover:border-primary"}`}
                      style={{ paddingInlineStart: `${0.75 + depth * 1.25}rem` }}
                    >
                      <Folder size={18} /> داخل مجلد «{node.title}»
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <label htmlFor="move-position" className="mb-2 block font-bold">٢. حدد ترتيبه في المكان الجديد</label>
              <select
                id="move-position"
                value={moveBeforeId ?? "end"}
                onChange={(event) => setMoveBeforeId(event.target.value === "end" ? null : Number(event.target.value))}
                className="w-full rounded-xl border border-border bg-background px-3 py-3 text-foreground"
              >
                <option value="end">في آخر القائمة</option>
                {childrenOf(selection.branch?.nodes ?? [], moveParentId)
                  .filter((node) => node.id !== movingNode?.id)
                  .map((node) => <option key={node.id} value={node.id}>قبل «{node.title}»</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Btn onClick={moveNode} disabled={moveSaving}>
                {moveSaving ? "جارٍ الحفظ…" : "حفظ المكان والترتيب"}
              </Btn>
              <Btn variant="outline" onClick={() => setMovingNode(null)} disabled={moveSaving}>إلغاء</Btn>
            </div>
          </div>
        </Modal2>
        <Modal2 open={viewerLecture !== null} onClose={() => setViewerLecture(null)} title={`متابعة مشاهدة: ${viewerLecture?.title ?? ""}`} size="lg">
          <p className="mb-4 text-sm text-muted-foreground">المشاهدة محسوبة من وقت التشغيل الفعلي، وآخر موضع هو مكان توقف الطالب الأخير.</p>
          <input aria-label="ابحث عن طالب في متابعة المشاهدة" value={viewerQuery} onChange={event => { setViewerQuery(event.target.value); setViewersPage(1); }} placeholder="ابحث بالاسم أو رقم الهاتف أو السنتر" className="mb-4 w-full rounded-xl border border-border bg-background px-3 py-2.5" />
          <div className="mb-4 flex flex-wrap gap-2" aria-label="فلتر حالة المشاهدة">{([ ["", "كل الطلاب"], ["watched", "شاهدها"], ["partial", "مشاهدة جزئية"], ["not_watched", "لم يشاهدها"] ] as const).map(([value, label]) => <Btn key={value} size="sm" variant={viewerStatus === value ? "primary" : "outline"} aria-pressed={viewerStatus === value} onClick={() => { setViewerStatus(value); setViewersPage(1); setExpandedViewerId(null); }}>{label}</Btn>)}</div>
          {viewersLoading ? <p>جارٍ تحميل المشاهدات…</p> : viewers.length ? (
            <div className="space-y-2">
              {viewers.map((viewer) => (
                <div key={viewer.student_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <div><strong>{viewer.name}</strong><p dir="ltr" className="text-xs text-muted-foreground">{viewer.phone}</p><p className="text-xs text-muted-foreground">{viewer.center_name || "السنتر غير مسجل"} · آخر مشاهدة: {viewer.last_watched_at ? new Date(viewer.last_watched_at).toLocaleString("ar-EG") : "—"}</p></div>
                  <div className="text-sm">{viewer.progress_percent}% مشاهدة</div>
                  <Badge2 variant={viewer.status === "watched" ? "success" : viewer.status === "partial" ? "warning" : "default"}>{viewer.status === "watched" ? "شاهدها" : viewer.status === "partial" ? "مشاهدة جزئية" : "لم يشاهدها"}</Badge2>
                  <Btn size="sm" variant="outline" aria-expanded={expandedViewerId === viewer.student_id} onClick={() => setExpandedViewerId(expandedViewerId === viewer.student_id ? null : viewer.student_id)}>تفاصيل التقدم</Btn>
                  {expandedViewerId === viewer.student_id && <div className="w-full rounded-xl bg-muted p-3 text-sm">شاهد {formatWatchTime(viewer.watched_seconds)} من {formatWatchTime(viewer.duration_seconds)} · توقف عند {formatWatchTime(viewer.last_position_seconds)} · التقدم {viewer.progress_percent}%</div>}
                  {(authUser?.role === "teacher" || authUser?.permissions?.includes("manage_students")) && <Btn size="sm" variant="outline" onClick={() => nav?.("student-detail", { studentId: viewer.student_id })}>متابعة الطالب</Btn>}
                </div>
              ))}
              {viewersTotalPages > 1 && <div className="flex items-center justify-center gap-3 pt-3"><Btn size="sm" variant="outline" disabled={viewersPage <= 1} onClick={() => viewerLecture && void openLectureViewers(viewerLecture, viewersPage - 1)}>السابق</Btn><span>{viewersPage} من {viewersTotalPages}</span><Btn size="sm" variant="outline" disabled={viewersPage >= viewersTotalPages} onClick={() => viewerLecture && void openLectureViewers(viewerLecture, viewersPage + 1)}>التالي</Btn></div>}
            </div>
          ) : <p className="py-6 text-center text-sm text-muted-foreground">لا يوجد طلاب مطابقون للبحث والفلتر المحددين.</p>}
        </Modal2>
        {uploadLecture && (
          <VideoUploadModal
            lecture={uploadLecture}
            existingAsset={uploadLecture.video_asset}
            onClose={() => setUploadLecture(null)}
            onReady={refresh}
          />
        )}
      </div>
    </div>
  );
}
