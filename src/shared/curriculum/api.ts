import { apiRequest } from "../api/client";

export type ContentStatus = "draft" | "published" | "hidden" | "archived";
export type VideoAssetSummary = { id:number; lecture_id?:number; lecture_title?:string; processing_status:"uploaded"|"processing"|"ready"|"failed"; duration_seconds?:number; available_qualities?:string[] };
export type Lecture = { id:number; title:string; description?:string; attachment_name?:string; attachment_url?:string; has_thumbnail?:boolean; position:number; status:ContentStatus; publish_at?:string; is_free:boolean; has_access?:boolean; additional_lesson_ids?:number[]; duration_seconds?:number; video_source_type?:"uploaded"|"youtube"; youtube_video_id?:string|null; progress?:{last_position_seconds:number;watched_seconds?:number;completed:boolean}|null; video_asset?:VideoAssetSummary|null };
export type CurriculumLocation = { lesson_id:number; academic_year:string; grade:string; grade_level:number; branch:string; chapter:string; lesson:string };
export type Lesson = { id:number; title:string; position:number; status:ContentStatus; publish_at?:string; is_free:boolean; has_access?:boolean; lectures:Lecture[] };
export type Chapter = { id:number; title:string; position:number; status:ContentStatus; publish_at?:string; lessons:Lesson[] };
export type CurriculumNode = { id:number; branch_id:number; parent_id?:number|null; kind:"folder"|"lecture"; title:string; position:number; lecture_id?:number; legacy_chapter_id?:number; legacy_lesson_id?:number; lecture?:Lecture; children:CurriculumNode[] };
export type Branch = { id:number; title:string; position:number; status:ContentStatus; publish_at?:string; chapters:Chapter[]; nodes?:CurriculumNode[] };
export type Curriculum = { academic_year:{id:number;name:string}|null; grade:{id:number;name:string;level:number}|null; branches:Branch[] };
export type ResourceType = "branches"|"chapters"|"lessons"|"lectures";
const singularName:Record<ResourceType,string>={branches:"branch",chapters:"chapter",lessons:"lesson",lectures:"lecture"};

export function loadCurriculum(filters:{academicYearId?:number;gradeId?:number}={}) {
  const query=new URLSearchParams();
  if(filters.academicYearId)query.set("academic_year_id",String(filters.academicYearId));
  if(filters.gradeId)query.set("grade_id",String(filters.gradeId));
  return apiRequest<{curriculum:Curriculum}>(`/curriculum?${query}`);
}

export const loadCurriculumLocations = () => apiRequest<{locations:CurriculumLocation[]}>("/curriculum_locations");

export function createContent(type:ResourceType,input:Record<string,unknown>) {
  return apiRequest(`/${type}`,{method:"POST",body:JSON.stringify({[singularName[type]]:input})});
}

export function updateContent(type:ResourceType,id:number,input:Record<string,unknown>) {
  return apiRequest(`/${type}/${id}`,{method:"PATCH",body:JSON.stringify({[singularName[type]]:input})});
}

export const deleteContent=(type:ResourceType,id:number)=>apiRequest<void>(`/${type}/${id}`,{method:"DELETE"});
export const reorderContent=(type:ResourceType,parent:Record<string,number>,orderedIds:number[])=>apiRequest<void>(`/${type}/reorder`,{method:"PATCH",body:JSON.stringify({...parent,ordered_ids:orderedIds})});

const requestKey=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const createCurriculumFolder=(branchId:number,parentId:number|null,title:string,key=requestKey())=>apiRequest<{node:CurriculumNode}>("/curriculum_nodes",{
  method:"POST",headers:{"Idempotency-Key":key},body:JSON.stringify({branch_id:branchId,node:{parent_id:parentId,title}})
});
export const renameCurriculumFolder=(branchId:number,nodeId:number,title:string)=>apiRequest<{node:CurriculumNode}>(`/curriculum_nodes/${nodeId}`,{
  method:"PATCH",body:JSON.stringify({branch_id:branchId,node:{title}})
});
export const moveCurriculumNode=(branchId:number,nodeId:number,parentId:number|null,beforeId?:number)=>apiRequest<{node:CurriculumNode}>(`/curriculum_nodes/${nodeId}/move`,{
  method:"PATCH",body:JSON.stringify({branch_id:branchId,node:{parent_id:parentId,before_id:beforeId}})
});
export const reorderCurriculumNodes=(branchId:number,parentId:number|null,orderedIds:number[])=>apiRequest<void>("/curriculum_nodes/reorder",{
  method:"PATCH",body:JSON.stringify({branch_id:branchId,node:{parent_id:parentId},ordered_ids:orderedIds})
});
export const deleteCurriculumFolder=(branchId:number,nodeId:number)=>apiRequest<void>(`/curriculum_nodes/${nodeId}?branch_id=${branchId}`,{method:"DELETE"});
export const backfillCurriculumFolders=(branchId:number)=>apiRequest<{nodes:CurriculumNode[]}>("/curriculum_nodes/backfill",{
  method:"POST",body:JSON.stringify({branch_id:branchId})
});
