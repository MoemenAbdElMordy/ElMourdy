import { apiRequest, downloadApiFile } from "../api/client";
import { addPagination, type PaginationMeta } from "../pagination";

export type ParentRecord = {
  id:number; name:string; phone:string; email?:string; status:"active"|"suspended"|"archived";
  verified_phone:string; students_count:number; created_at:string; last_active_at?:string;
  students?:Array<{id:number;name:string;phone:string;relation:string}>;
};
export type StudentPreview = {
  student:{id:number;name:string;status:string};
  enrollment:{academic_year:string;grade:string;grade_level:number}|null;
  statistics:{total_lectures:number;completed_lectures:number;highest_score?:number|null;subjects_count:number};
  subjects:Array<{id:number;title:string;total_lectures:number;completed_lectures:number}>;
};
export type ManagementReport = {
  overview:{students_count:number;attempts_count:number;average_score?:number|null;passed_count:number;risk_count:number;failed_count:number;completed_lecture_events:number};
  students:Array<{id:number;name:string;grade:string;academic_year:string;center_name?:string|null;average_score?:number|null;completed_lectures:number;attempts_count:number;last_active_at?:string|null}>;
};

export const loadParents=(query="",status="",page=1)=>{const params=new URLSearchParams();if(query)params.set("query",query);if(status)params.set("status",status);addPagination(params,page);return apiRequest<{parents:ParentRecord[];pagination:PaginationMeta}>(`/parents?${params}`);};
export const loadParent=(id:number)=>apiRequest<{parent:ParentRecord}>(`/parents/${id}`);
export const updateParent=(id:number,input:Record<string,unknown>)=>apiRequest<{parent:ParentRecord}>(`/parents/${id}`,{method:"PATCH",body:JSON.stringify({parent:input})});
export const resetParentPassword=(id:number,password:string)=>apiRequest<void>(`/parents/${id}/password`,{method:"PATCH",body:JSON.stringify({parent:{password}})});
export const loadStudentPreview=(id:number)=>apiRequest<{preview:StudentPreview}>(`/students/${id}/preview`);
export const loadManagementReport=(academicYearId?:number,gradeId?:number,page=1)=>{const params=new URLSearchParams();if(academicYearId)params.set("academic_year_id",String(academicYearId));if(gradeId)params.set("grade_id",String(gradeId));addPagination(params,page);return apiRequest<{report:ManagementReport;pagination:PaginationMeta}>(`/management_report?${params}`);};
export const exportManagementReport=(academicYearId?:number,gradeId?:number)=>{const params=new URLSearchParams();if(academicYearId)params.set("academic_year_id",String(academicYearId));if(gradeId)params.set("grade_id",String(gradeId));return downloadApiFile(`/management_report/export?${params}`,"management-report.docx");};
