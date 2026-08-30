import { API_BASE_URL, apiRequest, getSessionToken } from "../api/client";
import type { PaginationMeta } from "../pagination";

export type ActivationCodeRecord={id:number;code:string;status:"unused"|"redeemed"|"disabled"|"deleted";redeemed_by?:string;redeemed_at?:string;redeemed_lecture?:string};
export type ActivationCodeBatch={id:number;name:string;generic:boolean;lesson_id?:number;lesson?:string;academic_year_id?:number;academic_year?:string;grade_id?:number;grade?:string;quantity:number;expires_on:string;created_at:string;counts:Record<string,number>;codes:ActivationCodeRecord[]};
export type AccessGrant={id:number;access_type?:"lesson"|"lecture";student_user_id?:number;lesson_id?:number;lesson?:string;lecture_id?:number;lecture?:string;academic_year_id?:number;academic_year?:string;source?:"code"|"free"|"manual";expires_on:string;status:"active"|"expired"|"revoked"};

export const loadCodeBatches=(page=1)=>apiRequest<{batches:ActivationCodeBatch[];pagination:PaginationMeta}>(`/activation_code_batches?page=${page}`);
export const createCodeBatch=(input:Record<string,unknown>)=>apiRequest<{batch:ActivationCodeBatch;generated_codes:string[]}>("/activation_code_batches",{method:"POST",body:JSON.stringify({activation_code_batch:input})});
export const disableCode=(id:number)=>apiRequest(`/activation_codes/${id}`,{method:"PATCH"});
export const deleteCode=(id:number)=>apiRequest<void>(`/activation_codes/${id}`,{method:"DELETE"});
export const redeemCode=(code:string,lectureId:number)=>apiRequest<{access_grant:AccessGrant}>("/activation_codes/redeem",{method:"POST",body:JSON.stringify({code,lecture_id:lectureId})});
export const loadAccessGrants=(studentUserId:number)=>apiRequest<{access_grants:AccessGrant[]}>(`/lesson_access_grants?student_user_id=${studentUserId}`);
export const createManualGrant=(input:Record<string,unknown>)=>apiRequest<{access_grant:AccessGrant}>("/lesson_access_grants",{method:"POST",body:JSON.stringify({lesson_access_grant:input})});
export const revokeGrant=(id:number)=>apiRequest<{access_grant:AccessGrant}>(`/lesson_access_grants/${id}`,{method:"PATCH",body:JSON.stringify({lesson_access_grant:{status:"revoked"}})});

export async function exportCodeBatch(id:number){
  const response=await fetch(`${API_BASE_URL}/activation_code_batches/${id}/export.docx`,{headers:{Authorization:`Bearer ${getSessionToken()}`}});
  if(!response.ok)throw new Error("Export failed");
  const url=URL.createObjectURL(await response.blob());
  const link=document.createElement("a");
  link.href=url;
  link.download=`activation-codes-${id}.docx`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1_000);
}
