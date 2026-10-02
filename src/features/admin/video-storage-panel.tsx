import { useEffect, useRef, useState } from "react";
import { StorageLibrary } from "./storage-library";
import { ApiError } from "../../shared/api/client";
import { deleteVideoAsset, loadReusableVideoAssets, type VideoAsset } from "../../shared/videos/api";
import { Btn, Card2, notify } from "../../shared/ui";
import { PaginationControls, emptyPagination, type PaginationMeta } from "../../shared/pagination";


export function VideoStoragePanel({onChange}:{onChange:()=>void}){
  const [videos,setVideos]=useState<VideoAsset[]>([]);
  const [query,setQuery]=useState("");
  const [page,setPage]=useState(1);
  const [pagination,setPagination]=useState<PaginationMeta>(emptyPagination);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  const [deletingId,setDeletingId]=useState<number|null>(null);
  const requestId=useRef(0);
  const load=async()=>{const current=++requestId.current;setLoading(true);setError("");try{const response=await loadReusableVideoAssets({query:query.trim(),page});if(current===requestId.current){setVideos(response.video_assets);setPagination({...emptyPagination,...response.pagination});}}catch(error){if(current===requestId.current)setError(error instanceof ApiError?error.message:"تعذر تحميل مكتبة الفيديوهات");}finally{if(current===requestId.current)setLoading(false);}};
  useEffect(()=>{requestId.current++;const timer=window.setTimeout(()=>{void load();},query?250:0);return()=>{requestId.current++;window.clearTimeout(timer);};},[query,page]);
  const remove=async(video:VideoAsset)=>{
    const usage=video.used_by_lectures_count??0;
    const warning=usage>0?`هذا الفيديو مرتبط بعدد ${usage} من المحاضرات. سيُفصل منها جميعًا، ثم تُحذف كل جوداته نهائيًا من التخزين السحابي.`:"سيتم حذف كل جودات هذا الفيديو نهائيًا من التخزين السحابي.";
    if(!window.confirm(`${warning}\n\nلا يمكن التراجع عن هذا الإجراء. هل تريد الاستمرار؟`))return;
    setDeletingId(video.id);
    try{await deleteVideoAsset(video.id);await load();onChange();notify("تم حذف الفيديو نهائيًا من التخزين السحابي","success");}
    catch(error){notify(error instanceof ApiError?error.message:"تعذر حذف الفيديو نهائيًا","error");}
    finally{setDeletingId(null);}
  };
  return <div>{error&&<Card2><p role="alert">{error}</p><Btn onClick={()=>void load()}>إعادة المحاولة</Btn></Card2>}{loading&&<p role="status">جارٍ تحميل مكتبة الفيديوهات…</p>}<StorageLibrary videos={videos} busy={deletingId!==null||loading} onDelete={remove} query={query} onQueryChange={value=>{setQuery(value);setPage(1);}}/><PaginationControls pagination={pagination} onPageChange={setPage}/></div>;
}
