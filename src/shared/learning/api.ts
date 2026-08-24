import { apiRequest } from "../api/client";
import { addPagination, type PaginationMeta } from "../pagination";

export type ExamChoice = { id:number; body:string; is_correct?:boolean };
export type ExamQuestion = { id:number; body:string; explanation?:string|null; points:number|string; choices:ExamChoice[]; selected_choice_id?:number|null; correct_choice_id?:number; is_correct?:boolean };
export type Exam = {
  id:number; title:string; scope_type:"lesson"|"chapter"|"branch"|"comprehensive"; lesson_id?:number|null;
  assessment_type:"exam"|"homework"; show_answers_after_submission:boolean; correct_after_each_answer:boolean;
  chapter_id?:number|null; branch_id?:number|null; academic_year_id:number; grade_id:number; duration_minutes:number;
  max_attempts:number; pass_percent:number; risk_from_percent:number; risk_to_percent:number; status:"draft"|"published"|"hidden"|"archived";
  questions_count:number; attempts_count:number; questions?:ExamQuestion[];
};
export type ExamAttempt = {
  id:number; exam_id:number; exam_title:string; student_profile_id:number; student_name:string; attempt_number:number;
  assessment_type:"exam"|"homework";
  status:"in_progress"|"submitted"|"expired"; started_at:string; submitted_at?:string|null; score_points?:number|string|null;
  max_points?:number|string|null; percent?:number|string|null; result_status?:"passed"|"risk"|"failed"|null;
  duration_minutes?:number; questions?:ExamQuestion[];
};
export type Announcement = { id:number; title:string; body:string; status:"draft"|"published"|"archived"; publish_at?:string|null; created_at:string; grade_ids:number[]; user_ids:number[] };
export type SupportRequest = { id:number; request_type:"device_removal"|"extra_exam_attempt"|"parent_phone_change"; status:"pending"|"approved"|"rejected"|"cancelled"; reason?:string; payload:Record<string,unknown>; student_profile_id?:number|null; requester:{id:number;name:string;role:string}; created_at:string; actions:Array<{action:string;note?:string|null;reviewer_user_id:number;reviewer_name:string;created_at:string}> };

export const loadExams = (filters:{lessonId?:number;page?:number;assessmentType?:"exam"|"homework"}={}) => {const params=new URLSearchParams();if(filters.lessonId)params.set("lesson_id",String(filters.lessonId));if(filters.assessmentType)params.set("assessment_type",filters.assessmentType);addPagination(params,filters.page);return apiRequest<{exams:Exam[];pagination:PaginationMeta}>(`/exams?${params}`);};
export const loadExam = (id:number) => apiRequest<{exam:Exam}>(`/exams/${id}`);
export const saveExam = (input:Record<string,unknown>, id?:number) => apiRequest<{exam:Exam}>(id?`/exams/${id}`:"/exams", {method:id?"PATCH":"POST",body:JSON.stringify({exam:input})});
export const startExam = (examId:number) => apiRequest<{attempt:ExamAttempt}>(`/exams/${examId}/attempts`, {method:"POST"});
export const submitExam = (attemptId:number, answers:{question_id:number;choice_id:number}[]) => apiRequest<{attempt:ExamAttempt}>(`/exam_attempts/${attemptId}/submit`, {method:"POST",body:JSON.stringify({answers})});
export const answerExamQuestion = (attemptId:number, questionId:number, choiceId:number) => apiRequest<{answer:{question_id:number;selected_choice_id:number;is_correct?:boolean;correct_choice_id?:number;explanation?:string|null}}>(`/exam_attempts/${attemptId}/answer`, {method:"POST",body:JSON.stringify({question_id:questionId,choice_id:choiceId})});
export const loadAttempts = (studentProfileId?:number,page=1) => {const params=new URLSearchParams();if(studentProfileId)params.set("student_profile_id",String(studentProfileId));addPagination(params,page);return apiRequest<{attempts:ExamAttempt[];pagination:PaginationMeta}>(`/exam_attempts?${params}`);};
export const loadAttempt = (id:number) => apiRequest<{attempt:ExamAttempt}>(`/exam_attempts/${id}`);
export const loadAnnouncements = (page=1) => apiRequest<{announcements:Announcement[];pagination:PaginationMeta}>(`/announcements?page=${page}`);
export const saveAnnouncement = (input:Record<string,unknown>, id?:number) => apiRequest<{announcement:Announcement}>(id?`/announcements/${id}`:"/announcements", {method:id?"PATCH":"POST",body:JSON.stringify({announcement:input})});
export const deleteAnnouncement = (id:number) => apiRequest<void>(`/announcements/${id}`, {method:"DELETE"});
export const loadSupportRequests = (page=1) => apiRequest<{support_requests:SupportRequest[];pagination:PaginationMeta}>(`/support_requests?page=${page}`);
export const createSupportRequest = (input:Record<string,unknown>) => apiRequest<{support_request:SupportRequest}>("/support_requests", {method:"POST",body:JSON.stringify({support_request:input})});
export const reviewSupportRequest = (id:number, decision:"approve"|"reject", note="") => apiRequest<{support_request:SupportRequest}>(`/support_requests/${id}/review`, {method:"POST",body:JSON.stringify({decision,note})});
