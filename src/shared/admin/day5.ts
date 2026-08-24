import { apiRequest, downloadApiFile } from "../api/client";
import { addPagination, type PaginationMeta } from "../pagination";

export type Grade = { id: number; name: string; level: number };
export type GradeSummary = Grade & { students_count:number; branches_count:number; lessons_count:number; lectures_count:number };
export type AcademicYear = { id:number; name:string; starts_on:string; ends_on:string; status:"draft"|"active"|"archived"; students_count:number; grades:GradeSummary[] };
export type StudentRecord = {
  id:number; name:string; phone:string; email?:string; status:"active"|"suspended"|"archived";
  governorate?:string; school?:string; grade?:string; grade_id?:number; grade_level?:number; academic_year?:string; academic_year_id?:number;
  created_at:string; last_active_at?:string; birth_date?:string; parent_phone?:string; devices_count?:number;
  devices?:Array<{id:number;name?:string;browser?:string;os?:string;status:string;last_seen_at?:string}>;
  attempts?:Array<{id:number;exam_title:string;status:string;percent?:number|null;result_status?:string|null;submitted_at?:string|null}>;
  progress?:{completed_lectures:number;watched_lectures:number;highest_score?:number|null};
};
export type AssistantRecord = {
  id:number; name:string; phone:string; email?:string; title?:string;
  status:"active"|"suspended"|"archived"; permissions:string[]; created_at:string;
};
const localizedGradeName=(student:StudentRecord)=>student.grade_level===1?"الصف الأول الثانوي":student.grade_level===2?"الصف الثاني الثانوي":student.grade_level===3?"الصف الثالث الثانوي":student.grade;

export const loadAcademicYears = () => apiRequest<{academic_years:AcademicYear[];grades:Grade[]}>("/academic_years");
export const createAcademicYear = (input:{name:string;starts_on:string;ends_on:string;status:string}) => apiRequest<{academic_year:AcademicYear}>("/academic_years",{method:"POST",body:JSON.stringify({academic_year:input})});
export const updateAcademicYear = (id:number,input:Partial<AcademicYear>) => apiRequest<{academic_year:AcademicYear}>(`/academic_years/${id}`,{method:"PATCH",body:JSON.stringify({academic_year:input})});
export const loadGrades = () => apiRequest<{grades:Grade[]}>("/grades");
export const loadStudents = (filters:{query?:string;gradeId?:string;status?:string;page?:number;perPage?:number}={}) => {
  const query = new URLSearchParams();
  if(filters.query) query.set("query",filters.query);
  if(filters.gradeId) query.set("grade_id",filters.gradeId);
  if(filters.status) query.set("status",filters.status);
  addPagination(query,filters.page,filters.perPage);
  return apiRequest<{students:StudentRecord[];pagination:PaginationMeta}>(`/students?${query}`).then(response=>({...response,students:response.students.map(student=>({...student,grade:localizedGradeName(student)}))}));
};
export const exportStudents=(filters:{query?:string;gradeId?:string;status?:string}={})=>{const params=new URLSearchParams();if(filters.query)params.set("query",filters.query);if(filters.gradeId)params.set("grade_id",filters.gradeId);if(filters.status)params.set("status",filters.status);return downloadApiFile(`/students/export?${params}`,"students-report.docx");};
export const exportStudent=(id:number)=>downloadApiFile(`/students/${id}/export`,`student-${id}-report.docx`);
export const loadStudent = (id:number) => apiRequest<{student:StudentRecord}>(`/students/${id}`).then(response=>({student:{...response.student,grade:localizedGradeName(response.student)}}));
export const updateStudentStatus = (id:number,status:"active"|"suspended") => apiRequest<{student:StudentRecord}>(`/students/${id}`,{method:"PATCH",body:JSON.stringify({student:{status}})});
export const updateStudentEnrollment = (id:number,academicYearId:number,gradeId:number) => apiRequest<{student:StudentRecord}>(`/students/${id}/enrollment`,{method:"PATCH",body:JSON.stringify({enrollment:{academic_year_id:academicYearId,grade_id:gradeId}})});
export const resetStudentPassword = (id:number,password:string) => apiRequest<void>(`/students/${id}/password`,{method:"PATCH",body:JSON.stringify({student:{password}})});
export const updateStudentParentPhone = (id:number,phone:string) => apiRequest<{student:StudentRecord}>(`/students/${id}/parent_phone`,{method:"PATCH",body:JSON.stringify({parent_phone:{phone}})});
export const removeStudentDevice = (studentId:number,deviceId:number) => apiRequest<void>(`/students/${studentId}/devices/${deviceId}`,{method:"DELETE"});
export const copyAcademicYearContent = (targetId:number,sourceYearId:number) => apiRequest<{academic_year:AcademicYear;copied_branches_count:number}>(`/academic_years/${targetId}/copy_content`,{method:"POST",body:JSON.stringify({source_year_id:sourceYearId})});
export const rolloverAcademicYearStudents = (targetId:number,sourceYearId:number) => apiRequest<{academic_year:AcademicYear;moved_count:number;graduated_count:number}>(`/academic_years/${targetId}/rollover_students`,{method:"POST",body:JSON.stringify({source_year_id:sourceYearId})});
export const loadAssistants = (page=1) => apiRequest<{assistants:AssistantRecord[];permission_keys:string[];pagination:PaginationMeta}>(`/assistants?page=${page}`);
export const createAssistant = (input:Record<string,unknown>) => apiRequest<{assistant:AssistantRecord}>("/assistants",{method:"POST",body:JSON.stringify({assistant:input})});
export const updateAssistant = (id:number,input:Record<string,unknown>) => apiRequest<{assistant:AssistantRecord}>(`/assistants/${id}`,{method:"PATCH",body:JSON.stringify({assistant:input})});
export const archiveAssistant = (id:number) => apiRequest<void>(`/assistants/${id}`,{method:"DELETE"});
