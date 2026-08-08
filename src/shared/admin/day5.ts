import { apiRequest } from "../api/client";

export type Grade = { id: number; name: string; level: number };
export type AcademicYear = { id:number; name:string; starts_on:string; ends_on:string; status:"draft"|"active"|"archived"; students_count:number };
export type StudentRecord = {
  id:number; name:string; phone:string; email?:string; status:"active"|"suspended"|"archived";
  governorate?:string; school?:string; grade?:string; grade_id?:number; grade_level?:number; academic_year?:string; academic_year_id?:number;
  created_at:string; last_active_at?:string; birth_date?:string; parent_phone?:string; devices_count?:number;
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
export const loadStudents = (filters:{query?:string;gradeId?:string;status?:string}={}) => {
  const query = new URLSearchParams();
  if(filters.query) query.set("query",filters.query);
  if(filters.gradeId) query.set("grade_id",filters.gradeId);
  if(filters.status) query.set("status",filters.status);
  return apiRequest<{students:StudentRecord[]}>(`/students?${query}`).then(response=>({students:response.students.map(student=>({...student,grade:localizedGradeName(student)}))}));
};
export const loadStudent = (id:number) => apiRequest<{student:StudentRecord}>(`/students/${id}`).then(response=>({student:{...response.student,grade:localizedGradeName(response.student)}}));
export const updateStudentStatus = (id:number,status:"active"|"suspended") => apiRequest<{student:StudentRecord}>(`/students/${id}`,{method:"PATCH",body:JSON.stringify({student:{status}})});
export const loadAssistants = () => apiRequest<{assistants:AssistantRecord[];permission_keys:string[]}>("/assistants");
export const createAssistant = (input:Record<string,unknown>) => apiRequest<{assistant:AssistantRecord}>("/assistants",{method:"POST",body:JSON.stringify({assistant:input})});
export const updateAssistant = (id:number,input:Record<string,unknown>) => apiRequest<{assistant:AssistantRecord}>(`/assistants/${id}`,{method:"PATCH",body:JSON.stringify({assistant:input})});
