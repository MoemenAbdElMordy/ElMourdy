import type { Branch, Chapter, CurriculumNode, Lecture, Lesson } from "../../shared/curriculum/api";

export type StudentPresentationItem = {
  id: number;
  kind: "folder" | "lecture";
  title: string;
  lecture?: Lecture;
  lessonTitle?: string;
  children: StudentPresentationItem[];
};

function fromNode(node: CurriculumNode, folderTitle: string): StudentPresentationItem | null {
  if (node.kind === "lecture") {
    if (!node.lecture) return null;
    return { id: node.id, kind: "lecture", title: node.lecture.title, lecture: node.lecture, lessonTitle: folderTitle, children: [] };
  }
  return {
    id: node.id, kind: "folder", title: node.title,
    children: (node.children ?? []).map(child => fromNode(child, node.title)).filter((item): item is StudentPresentationItem => item !== null),
  };
}

export function studentPresentationItems(branch: Branch): StudentPresentationItem[] {
  const nodes = (branch.nodes ?? []).map(node => fromNode(node, branch.title)).filter((item): item is StudentPresentationItem => item !== null);
  if (nodes.length) {
    const placed = new Set<number>();
    const collect = (items: StudentPresentationItem[]) => items.forEach(item => {
      if (item.lecture) placed.add(item.lecture.id);
      collect(item.children);
    });
    collect(nodes);
    // Older lectures may not have been backfilled into the folder tree yet.
    const unplaced = branch.chapters.flatMap(chapter => chapter.lessons.flatMap(lesson =>
      lesson.lectures.filter(lecture => !placed.has(lecture.id)).map(lecture => ({
        id: -lecture.id, kind: "lecture" as const, title: lecture.title, lecture,
        lessonTitle: lesson.title, children: [],
      }))));
    return unplaced.length ? [...nodes, { id: 0, kind: "folder", title: "محاضرات أخرى", children: unplaced }] : nodes;
  }
  return branch.chapters.map(chapter => ({
    id: chapter.id, kind: "folder" as const, title: chapter.title,
    children: chapter.lessons.flatMap(lesson => lesson.lectures.map(lecture => ({
      id: lecture.id, kind: "lecture" as const, title: lecture.title, lecture,
      lessonTitle: lesson.title, children: [],
    }))),
  }));
}

export function findStudentFolder(items: StudentPresentationItem[], id: number): StudentPresentationItem | null {
  for (const item of items) {
    if (item.kind !== "folder") continue;
    if (item.id === id) return item;
    const nested = findStudentFolder(item.children, id);
    if (nested) return nested;
  }
  return null;
}

export function findStudentFolderParent(items: StudentPresentationItem[], id: number, parent: StudentPresentationItem | null = null): StudentPresentationItem | null {
  for (const item of items) {
    if (item.kind !== "folder") continue;
    if (item.id === id) return parent;
    const nested = findStudentFolderParent(item.children, id, item);
    if (nested) return nested;
  }
  return null;
}

export function studentVideoBranch(branch: Branch): Branch {
  const roots = studentPresentationItems(branch);
  const chapters: Chapter[] = [];
  const addChapter = (root: StudentPresentationItem) => {
    const lessons: Lesson[] = [];
    const collect = (item: StudentPresentationItem, path: string[]) => {
      if (item.lecture) {
        const title = path.at(-1) ?? branch.title;
        let lesson = lessons.find(candidate => candidate.title === title);
        if (!lesson) {
          lesson = { id: item.id, title, position: lessons.length + 1, status: "published", is_free: false, lectures: [] };
          lessons.push(lesson);
        }
        if (!lesson.lectures.some(lecture => lecture.id === item.lecture!.id)) lesson.lectures.push(item.lecture);
      } else item.children.forEach(child => collect(child, [...path, item.title]));
    };
    collect(root, []);
    if (lessons.length) chapters.push({ id: root.id, title: root.title, position: chapters.length + 1, status: "published", lessons });
  };
  const direct = roots.filter(item => item.kind === "lecture");
  if (direct.length) addChapter({ id: 0, kind: "folder", title: "محاضرات المادة", children: direct });
  roots.filter(item => item.kind === "folder").forEach(addChapter);
  return { ...branch, chapters };
}
