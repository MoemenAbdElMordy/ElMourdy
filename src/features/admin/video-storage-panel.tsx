import { useEffect, useMemo, useState } from "react";
import { Film, RefreshCw, Search, Trash2 } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import { deleteVideoAsset, loadReusableVideoAssets, type VideoAsset } from "../../shared/videos/api";
import { Badge2, Btn, Card2, notify } from "../../shared/ui";

const formatSize=(bytes?:number)=>bytes?`${(bytes/1024/1024/1024).toFixed(2)} GB`:"—";
const statusLabel:Record<VideoAsset["processing_status"],string>={uploaded:"بانتظار المعالجة",processing:"جارٍ التجهيز",ready:"جاهز",failed:"فشلت المعالجة"};

export function VideoStoragePanel({onChange}:{onChange:()=>void}){
  const [videos,setVideos]=useState<VideoAsset[]>([]);
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(true);
  const [deletingId,setDeletingId]=useState<number|null>(null);
  const load=async()=>{setLoading(true);try{setVideos((await loadReusableVideoAssets()).video_assets);}catch(error){notify(error instanceof ApiError?error.message:"تعذر تحميل مكتبة الفيديوهات","error");}finally{setLoading(false);}};
  useEffect(()=>{void load();},[]);
  const filtered=useMemo(()=>{const value=query.trim().toLocaleLowerCase("ar");return value?videos.filter(video=>(video.lecture_title??`فيديو رقم ${video.id}`).toLocaleLowerCase("ar").includes(value)):videos;},[query,videos]);
  const total=videos.reduce((sum,video)=>sum+(video.storage_size_bytes??0),0);
  const remove=async(video:VideoAsset)=>{
    const usage=video.used_by_lectures_count??0;
    const warning=usage>0?`هذا الفيديو مرتبط بعدد ${usage} من المحاضرات. سيُفصل منها جميعًا، ثم تُحذف كل جوداته نهائيًا من التخزين السحابي.`:"سيتم حذف كل جودات هذا الفيديو نهائيًا من التخزين السحابي.";
    if(!window.confirm(`${warning}\n\nلا يمكن التراجع عن هذا الإجراء. هل تريد الاستمرار؟`))return;
    setDeletingId(video.id);
    try{await deleteVideoAsset(video.id);setVideos(items=>items.filter(item=>item.id!==video.id));onChange();notify("تم حذف الفيديو نهائيًا من التخزين السحابي","success");}
    catch(error){notify(error instanceof ApiError?error.message:"تعذر حذف الفيديو نهائيًا","error");}
    finally{setDeletingId(null);}
  };
  return <Card2 className="mb-4 border-red-500/30">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-black"><Trash2 size={19} className="text-red-500"/> الحذف النهائي للفيديوهات</h2><p className="mt-1 text-sm text-muted-foreground">ابحث عن أي فيديو واحذفه بكل جوداته من التخزين السحابي. حذف الفيديو لا يحذف المحاضرة.</p></div><div className="text-left"><strong className="block">{formatSize(total)}</strong><span className="text-xs text-muted-foreground">إجمالي المساحة المسجلة</span></div></div>
    <div className="relative mb-4"><Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="ابحث باسم الفيديو أو المحاضرة" className="w-full rounded-xl border border-border bg-background py-3 pe-10 ps-3 text-sm"/></div>
    <div className="max-h-80 space-y-2 overflow-y-auto">{filtered.map(video=><div key={video.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"><Film size={19} className="shrink-0 text-primary"/><div className="min-w-48 flex-1"><strong className="block truncate">{video.lecture_title??`فيديو رقم ${video.id}`}</strong><div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{formatSize(video.storage_size_bytes)}</span><span>مرتبط بـ {video.used_by_lectures_count??0} محاضرة</span><Badge2 variant={video.processing_status==="ready"?"success":video.processing_status==="failed"?"danger":"warning"}>{statusLabel[video.processing_status]}</Badge2></div></div><Btn type="button" size="sm" variant="danger" disabled={deletingId!==null} onClick={()=>remove(video)}><Trash2 size={14}/>{deletingId===video.id?"جارٍ الحذف…":"حذف نهائي"}</Btn></div>)}
      {!loading&&!filtered.length&&<p className="py-6 text-center text-sm text-muted-foreground">{query?"لا توجد فيديوهات مطابقة للبحث":"لا توجد فيديوهات في التخزين"}</p>}
      {loading&&<p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"><RefreshCw className="animate-spin" size={16}/> جارٍ تحميل الفيديوهات…</p>}
    </div>
  </Card2>;
}
