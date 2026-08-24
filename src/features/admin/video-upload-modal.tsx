import { useEffect, useRef, useState } from "react";
import { CheckCircle, Film, Link, Library, RefreshCw, Trash2, Upload } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import type { VideoAssetSummary } from "../../shared/curriculum/api";
import {
  completeVideoUpload,
  createVideoUpload,
  attachYouTubeVideo,
  deleteVideoAsset,
  loadVideoAsset,
  retryVideoProcessing,
  reuseVideoAsset,
  loadReusableVideoAssets,
  uploadVideoFile,
  type VideoAsset,
} from "../../shared/videos/api";
import { Badge2, Btn, Modal2, notify } from "../../shared/ui";

const statusLabels={uploaded:"في قائمة الانتظار",processing:"جارٍ إنشاء الجودات",ready:"جاهز للمشاهدة",failed:"فشلت المعالجة"};
const formatDuration=(seconds?:number)=>seconds?`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`:"غير محددة";
const formatSize=(bytes?:number)=>bytes?`${(bytes/1024/1024).toFixed(1)} MB`:"—";

export function VideoUploadModal({lecture,existingAsset,onClose,onReady}:{lecture:{id:number;title:string;video_source_type?:"uploaded"|"youtube";youtube_video_id?:string|null};existingAsset?:VideoAssetSummary|null;onClose:()=>void;onReady:()=>void}){
  const [file,setFile]=useState<File|null>(null);
  const [asset,setAsset]=useState<VideoAsset|null>(existingAsset?{...existingAsset,lecture_id:lecture.id}:null);
  const [mode,setMode]=useState<"manage"|"upload"|"youtube"|"reuse">(existingAsset||lecture.video_source_type==="youtube"?"manage":"upload");
  const [youtubeUrl,setYoutubeUrl]=useState(lecture.youtube_video_id?`https://www.youtube.com/watch?v=${lecture.youtube_video_id}`:"");
  const [reusable,setReusable]=useState<VideoAsset[]>([]);
  const [selectedAssetId,setSelectedAssetId]=useState("");
  const [progress,setProgress]=useState(0);
  const [busy,setBusy]=useState(false);
  const inputRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{if(!existingAsset)return;loadVideoAsset(existingAsset.id).then(response=>setAsset(response.video_asset)).catch(()=>undefined);},[existingAsset?.id]);
  useEffect(()=>{loadReusableVideoAssets().then(response=>setReusable(response.video_assets)).catch(()=>setReusable([]));},[]);
  useEffect(()=>{
    if(!asset||!["uploaded","processing"].includes(asset.processing_status))return;
    const timer=window.setInterval(async()=>{try{const response=await loadVideoAsset(asset.id);setAsset(response.video_asset);if(response.video_asset.processing_status==="ready"){window.clearInterval(timer);setBusy(false);onReady();notify("الفيديو جاهز للمشاهدة","success");}if(response.video_asset.processing_status==="failed"){window.clearInterval(timer);setBusy(false);}}catch{window.clearInterval(timer);setBusy(false);notify("تعذر متابعة حالة معالجة الفيديو","error");}},5000);
    return()=>window.clearInterval(timer);
  },[asset?.id,asset?.processing_status,onReady]);

  const start=async()=>{if(!file)return;setBusy(true);setProgress(0);try{const created=await createVideoUpload(lecture.id,file);setAsset(created.video_asset);await uploadVideoFile(file,created.upload,setProgress);setAsset((await completeVideoUpload(lecture.id,created.video_asset.id)).video_asset);setMode("manage");notify("تم رفع الفيديو وبدأت المعالجة","success");}catch(error){notify(error instanceof ApiError?error.message:error instanceof Error?error.message:"تعذر رفع الفيديو","error");setBusy(false);}};
  const retry=async()=>{if(!asset)return;setBusy(true);try{setAsset((await retryVideoProcessing(asset.id)).video_asset);notify("بدأت إعادة معالجة الفيديو","success");}catch(error){notify(error instanceof ApiError?error.message:"تعذرت إعادة معالجة الفيديو","error");setBusy(false);}};
  const saveYoutube=async()=>{if(!youtubeUrl.trim())return;setBusy(true);try{await attachYouTubeVideo(lecture.id,youtubeUrl);notify("تم ربط فيديو YouTube بالمحاضرة","success");onReady();onClose();}catch(error){notify(error instanceof ApiError?error.message:"رابط YouTube غير صالح","error");}finally{setBusy(false);}};
  const reuse=async()=>{if(!selectedAssetId)return;setBusy(true);try{const response=await reuseVideoAsset(lecture.id,Number(selectedAssetId));setAsset(response.video_asset);notify("تم استخدام الفيديو دون رفعه مرة أخرى","success");onReady();onClose();}catch(error){notify(error instanceof ApiError?error.message:"تعذر استخدام الفيديو","error");}finally{setBusy(false);}};
  const deletionError=(error:unknown)=>error instanceof ApiError&&error.status===422?"لا يمكن حذف فيديو مستخدم في محاضرة أخرى":error instanceof ApiError?error.message:"تعذر حذف الفيديو";
  const removeReusable=async(item:VideoAsset)=>{if(!item.can_delete){notify("لا يمكن حذف فيديو مستخدم في محاضرة أخرى","error");return;}if(!window.confirm(`سيتم حذف «${item.lecture_title??`فيديو رقم ${item.id}`}» نهائيًا من التخزين السحابي بكل جوداته. لا يمكن التراجع. هل تريد الاستمرار؟`))return;setBusy(true);try{await deleteVideoAsset(item.id);setReusable(items=>items.filter(candidate=>candidate.id!==item.id));if(selectedAssetId===String(item.id))setSelectedAssetId("");if(asset?.id===item.id){setAsset(null);setMode("upload");}onReady();notify("تم حذف الفيديو نهائيًا من التخزين السحابي","success");}catch(error){notify(deletionError(error),"error");}finally{setBusy(false);}};
  const remove=async()=>{if(!asset||!window.confirm("سيتم حذف الفيديو الحالي نهائيًا من التخزين السحابي بكل جوداته. لا يمكن التراجع. هل تريد الاستمرار؟"))return;setBusy(true);try{await deleteVideoAsset(asset.id);setAsset(null);setMode("upload");setFile(null);setProgress(0);onReady();notify("تم حذف الفيديو نهائيًا من التخزين السحابي","success");}catch(error){notify(deletionError(error),"error");}finally{setBusy(false);}};
  const status=asset?.processing_status;

  return <Modal2 open onClose={onClose} title="إدارة فيديو المحاضرة" size="lg"><div className="space-y-4">
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3"><div><p className="text-xs text-muted-foreground">المحاضرة</p><strong>{lecture.title}</strong></div>{status&&<Badge2 variant={status==="ready"?"success":status==="failed"?"danger":"warning"}>{statusLabels[status]}</Badge2>}</div>
    {mode==="manage"&&lecture.video_source_type==="youtube"&&!asset&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-800"><Link className="mx-auto mb-2"/><strong>فيديو YouTube مرتبط بالمحاضرة</strong><p className="mt-1 text-xs" dir="ltr">{youtubeUrl}</p></div>}
    {mode==="manage"&&asset&&<>
      <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">المدة</p><strong>{formatDuration(asset.duration_seconds)}</strong></div><div className="rounded-xl border border-border p-3 sm:col-span-2"><p className="text-xs text-muted-foreground">الجودات المتاحة</p><div className="mt-2 flex flex-wrap gap-2">{asset.variants?.length?asset.variants.map(variant=><Badge2 key={variant.quality} variant={variant.status==="ready"?"success":"default"}>{variant.quality} • {formatSize(variant.size_bytes)}</Badge2>):asset.available_qualities?.map(quality=><Badge2 key={quality} variant="success">{quality}</Badge2>)??<span>لا توجد جودات بعد</span>}</div></div></div>
      {status==="processing"||status==="uploaded"?<div className="rounded-xl bg-primary/10 p-4 text-center"><RefreshCw className="mx-auto mb-2 animate-spin text-primary"/><p>تجهيز الفيديو مستمر في الخلفية، ويمكنك إغلاق النافذة بأمان.</p></div>:null}
      {status==="failed"&&<div className="rounded-xl bg-red-50 p-4 text-center text-red-700"><p>فشلت معالجة الفيديو. يمكنك إعادة المحاولة إذا كان الملف الأصلي ما زال متاحًا، أو رفع نسخة جديدة.</p><Btn className="mt-3" variant="outline" disabled={busy} onClick={retry}><RefreshCw size={15}/> إعادة المعالجة</Btn></div>}
      {status==="ready"&&<div className="rounded-xl bg-green-50 p-4 text-center text-green-700"><CheckCircle className="mx-auto mb-2"/><p>الفيديو جاهز بالجودات الموضحة أعلاه.</p></div>}
      <div className="grid gap-2 sm:grid-cols-2"><Btn variant="outline" disabled={busy} onClick={()=>{setMode("upload");setFile(null);setProgress(0);}}><Upload size={15}/> استبدال الفيديو</Btn><Btn variant="danger" disabled={busy} onClick={remove}><Trash2 size={15}/> حذف الفيديو</Btn></div>
    </>}
    <div className="grid grid-cols-3 gap-2">
      <Btn type="button" size="sm" variant={mode==="upload"?"primary":"outline"} onClick={()=>setMode("upload")}><Upload size={14}/> من الجهاز</Btn>
      <Btn type="button" size="sm" variant={mode==="youtube"?"primary":"outline"} onClick={()=>setMode("youtube")}><Link size={14}/> YouTube</Btn>
      <Btn type="button" size="sm" variant={mode==="reuse"?"primary":"outline"} onClick={()=>setMode("reuse")}><Library size={14}/> فيديو سابق</Btn>
    </div>
    {mode==="upload"&&<>
      {asset&&<button className="text-sm text-primary hover:underline" onClick={()=>setMode("manage")}>العودة إلى الفيديو الحالي</button>}
      <input ref={inputRef} className="hidden" type="file" accept="video/mp4,video/quicktime,video/x-matroska,video/webm" onChange={event=>setFile(event.target.files?.[0]??null)}/>
      <button type="button" className="w-full rounded-2xl border-2 border-dashed border-border p-8 text-center hover:border-primary" onClick={()=>inputRef.current?.click()}><Film className="mx-auto mb-2 text-primary"/><strong>{file?.name??"اختر ملف الفيديو الجديد"}</strong><p className="mt-2 text-xs text-muted-foreground">MP4 أو MOV أو MKV أو WebM، بحد أقصى 6 جيجابايت</p></button>
      {busy&&<div><div className="mb-1 flex justify-between text-sm"><span>جارٍ الرفع</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{width:`${progress}%`}}/></div></div>}
      <Btn className="w-full" disabled={!file||busy} onClick={start}><Upload size={15}/>{busy?"جارٍ الرفع…":asset?"رفع الفيديو البديل":"ابدأ الرفع"}</Btn>
    </>}
    {mode==="youtube"&&<div className="space-y-3"><label className="block text-sm font-bold">رابط فيديو YouTube<input dir="ltr" type="url" value={youtubeUrl} onChange={event=>setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-left font-sans"/></label><p className="text-xs text-muted-foreground">سيعمل الفيديو داخل المنصة ولن ينتقل الطالب إلى موقع YouTube.</p><Btn className="w-full" disabled={!youtubeUrl.trim()||busy} onClick={saveYoutube}><Link size={15}/> ربط الفيديو</Btn></div>}
    {mode==="reuse"&&<div className="space-y-3"><label className="block text-sm font-bold">اختر فيديو مرفوعًا من قبل<select value={selectedAssetId} onChange={event=>setSelectedAssetId(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background p-3"><option value="">اختر الفيديو</option>{reusable.map(item=><option key={item.id} value={item.id}>{item.lecture_title??`فيديو رقم ${item.id}`} — {formatDuration(item.duration_seconds)}</option>)}</select></label><p className="text-xs text-muted-foreground">سيُستخدم نفس الملف والجودات من غير نسخ أو رفع أو معالجة جديدة.</p><Btn className="w-full" disabled={!selectedAssetId||busy} onClick={reuse}><Library size={15}/> استخدام الفيديو المختار</Btn><div className="border-t border-border pt-3"><div className="mb-2 flex items-center justify-between gap-2"><strong className="text-sm">إدارة مساحة التخزين</strong><span className="text-xs text-muted-foreground">الإجمالي: {formatSize(reusable.reduce((sum,item)=>sum+(item.storage_size_bytes??0),0))}</span></div><div className="max-h-56 space-y-2 overflow-y-auto">{reusable.map(item=><div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{item.lecture_title??`فيديو رقم ${item.id}`}</p><p className="text-xs text-muted-foreground">{formatSize(item.storage_size_bytes)} • مستخدم في {item.used_by_lectures_count??0} محاضرة</p></div><Btn type="button" size="sm" variant="danger" disabled={busy||!item.can_delete} title={item.can_delete?"حذف نهائي من التخزين السحابي":"الفيديو مستخدم في محاضرة أخرى"} onClick={()=>removeReusable(item)}><Trash2 size={14}/> حذف نهائي</Btn></div>)}{!reusable.length&&<p className="py-4 text-center text-sm text-muted-foreground">لا توجد فيديوهات مرفوعة.</p>}</div></div></div>}
  </div></Modal2>;
}
