import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Edit2,
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
const descendantIds = (node: CurriculumNode): number[] => [
  node.id,
  ...node.children.flatMap(descendantIds),
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
  depth = 0,
  onEdit,
  onEditLecture,
  onVideo,
  onPublish,
  onDelete,
  onDeleteLecture,
  onAdd,
  onAddLecture,
  onMove,
  onReorder,
  onDropNode,
}: {
  nodes: CurriculumNode[];
  depth?: number;
  onEdit: (node: CurriculumNode) => void;
  onEditLecture: (node: CurriculumNode) => void;
  onVideo: (node: CurriculumNode) => void;
  onPublish: (node: CurriculumNode) => void;
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
          <div
            aria-label={`ضع العنصر قبل ${node.title}`}
            className="my-1 h-2 rounded-full transition-colors hover:bg-primary/40"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const sourceId = Number(event.dataTransfer.getData("text/plain"));
              if (sourceId) onDropNode(sourceId, node.parent_id ?? null, node.id);
            }}
          />
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
            <span
              draggable
              role="button"
              tabIndex={0}
              title="اسحب لترتيب العنصر، أو استخدم زر نقل وترتيب"
              aria-label={`اسحب ${node.title} لنقله`}
              className="cursor-grab rounded-lg p-1 text-muted-foreground active:cursor-grabbing"
              onDragStart={(event) => event.dataTransfer.setData("text/plain", String(node.id))}
            >
              <GripVertical size={18} />
            </span>
            <div className="flex flex-col">
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
            </div>
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
                  : "محاضرة"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {node.kind === "folder" ? (
                <>
                  <button
                    type="button"
                    title="إضافة مجلد بالداخل"
                    onClick={() => onAdd(node)}
                  >
                    <Folder size={16} />
                  </button>
                  <button
                    type="button"
                    title="إضافة محاضرة بالداخل"
                    onClick={() => onAddLecture(node)}
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    type="button"
                    title="تعديل الاسم"
                    onClick={() => onEdit(node)}
                  >
                    <Edit2 size={16} />
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
                    title="حذف المجلد الفارغ"
                    onClick={() => onDelete(node)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    title="تعديل المحاضرة"
                    onClick={() => onEditLecture(node)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    title="إدارة فيديو المحاضرة"
                    onClick={() => onVideo(node)}
                  >
                    <Upload size={16} />
                  </button>
                  <button
                    type="button"
                    title="نشر المحاضرة"
                    onClick={() => onPublish(node)}
                  >
                    <BookOpen size={16} />
                  </button>
                  <button
                    type="button"
                    title="نقل المحاضرة أو تغيير ترتيبها"
                    aria-label={`نقل وترتيب ${node.title}`}
                    onClick={() => onMove(node)}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/40 px-2 py-1 text-sm font-bold text-primary hover:bg-primary/10"
                  >
                    <Move size={16} /> نقل وترتيب
                  </button>
                  <button
                    type="button"
                    title="حذف المحاضرة"
                    onClick={() => onDeleteLecture(node)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </>
              )}
            </div>
          </div>
          {node.kind === "folder" && (
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
                depth={depth + 1}
                onEdit={onEdit}
                onEditLecture={onEditLecture}
                onVideo={onVideo}
                onPublish={onPublish}
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
      <div
        className="h-3 rounded-full transition-colors hover:bg-primary/40"
        aria-label="ضع العنصر في نهاية هذا المستوى"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const sourceId = Number(event.dataTransfer.getData("text/plain"));
          if (sourceId) onDropNode(sourceId, nodes[0]?.parent_id ?? null);
        }}
      />
    </div>
  );
}
export function CurriculumManagePage({ params }: any) {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [yearId, setYearId] = useState(0);
  const [gradeId, setGradeId] = useState(0);
  const [tree, setTree] = useState<Curriculum | null>(null);
  const [locations, setLocations] = useState<CurriculumLocation[]>([]);
  const [selection, setSelection] = useState<Selection>({});
  const [modal, setModal] = useState(false);
  const [editor, setEditor] = useState(emptyEditor);
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
            publishAt: item.publish_at?.slice(0, 16) ?? "",
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
    const chapter = selection.branch.chapters[0];
    const lesson = chapter?.lessons[0];
    if (!lesson) {
      notify("تعذر تحديد ارتباط المحاضرة القديم", "error");
      return;
    }
    const lecture = node.lecture;
    setDirectLecture(true);
    setSelection({ branch: selection.branch, chapter, lesson });
    setEditing(lecture);
    setEditor({
      title: lecture.title,
      description: lecture.description ?? "",
      attachmentName: lecture.attachment_name ?? "",
      attachmentUrl: lecture.attachment_url ?? "",
      publishAt: lecture.publish_at?.slice(0, 16) ?? "",
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
      const lectureFields =
        effectiveLevel === "lectures"
          ? {
              description: editor.description || null,
              attachment_name: editor.attachmentName || null,
              attachment_url: editor.attachmentUrl || null,
              publish_at: editor.publishAt || null,
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
            status: "draft",
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
          editing ? "تم حفظ تعديلات المحاضرة" : "تمت إضافة المحتوى",
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
      !window.confirm("سيتم حذف المجلد الفارغ فقط. هل تريد الاستمرار؟")
    )
      return;
    try {
      await deleteCurriculumFolder(selection.branch.id, node.id);
      await refresh();
      notify("تم حذف المجلد الفارغ", "success");
    } catch (error) {
      notify(
        error instanceof ApiError
          ? error.message
          : "لا يمكن حذف مجلد يحتوي عناصر",
        "error",
      );
    }
  };
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
    <div className="min-h-screen bg-background p-4 sm:p-6">
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
              أنشئ مجلدًا أو محاضرة، ثم استخدم «نقل وترتيب» لاختيار مكانها بسهولة. ويمكنك أيضًا السحب للترتيب السريع.
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {branchTreeMode ? (
              <>
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
          </div>
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
        <VideoStoragePanel onChange={refresh} />
        {branchTreeMode ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              <strong>تريد تغيير مكان عنصر؟</strong> اضغط «نقل وترتيب» بجانبه، اختر المجلد ثم موضعه، واضغط «حفظ المكان». الأسهم الصغيرة تغيّر ترتيبه داخل نفس المجلد فقط.
            </div>
            {selection.branch?.nodes?.length ? (
              <FolderTree
                nodes={selection.branch.nodes}
                onEdit={(node) => openFolderEditor(null, node)}
                onEditLecture={editTreeLecture}
                onVideo={manageTreeLectureVideo}
                onPublish={publishTreeLecture}
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
                  لا يوجد محتوى بعد. أضف مجلدًا أو محاضرة.
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
                    <div className="flex flex-col">
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
                    </div>
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
                  <Input2
                    label="موعد النشر (اختياري)"
                    type="datetime-local"
                    value={editor.publishAt}
                    onChange={(event) =>
                      setEditor((value) => ({
                        ...value,
                        publishAt: event.target.value,
                      }))
                    }
                  />
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
                              {location.branch} / {location.chapter} /{" "}
                              {location.lesson}
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
                    صورة بصيغة JPG أو PNG أو WebP، بحد أقصى ٥ ميجابايت.
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
