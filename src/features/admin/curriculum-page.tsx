import { useCallback, useEffect, useState } from "react";
import { Archive, BookOpen, ChevronDown, ChevronLeft, ChevronUp, Edit2, EyeOff, Plus, Trash2, Upload, Video } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import { loadAcademicYears, loadGrades, type AcademicYear, type Grade } from "../../shared/admin/day5";
import { createContent, deleteContent, loadCurriculum, reorderContent, updateContent, type Branch, type Chapter, type ContentStatus, type Curriculum, type Lesson, type ResourceType } from "../../shared/curriculum/api";
import { Badge2, Btn, Card2, Input2, Modal2, Select2, notify } from "../../shared/ui";
import { VideoUploadModal } from "./video-upload-modal";

type Selection={branch?:Branch;chapter?:Chapter;lesson?:Lesson};
const gradeLabel=(grade:Grade)=>grade.level===1?"الصف الأول الثانوي":grade.level===2?"الصف الثاني الثانوي":"الصف الثالث الثانوي";
const statusLabel:Record<ContentStatus,string>={draft:"مسودة",published:"منشور",hidden:"مخفي",archived:"مؤرشف"};
const videoStatusLabel=(status?:string)=>status==="ready"?"الفيديو جاهز":status==="failed"?"فشلت المعالجة":status?"جارٍ تجهيز الفيديو":"بدون فيديو";

export function CurriculumManagePage(){
  const [years,setYears]=useState<AcademicYear[]>([]);
  const [grades,setGrades]=useState<Grade[]>([]);
  const [yearId,setYearId]=useState(0);
  const [gradeId,setGradeId]=useState(0);
  const [tree,setTree]=useState<Curriculum|null>(null);
  const [selection,setSelection]=useState<Selection>({});
  const [modal,setModal]=useState(false);
  const [title,setTitle]=useState("");
  const [editingId,setEditingId]=useState<number|null>(null);
  const [uploadLecture,setUploadLecture]=useState<{id:number;title:string}|null>(null);
  const level:ResourceType=selection.lesson?"lectures":selection.chapter?"lessons":selection.branch?"chapters":"branches";
  const items=selection.lesson?.lectures??selection.chapter?.lessons??selection.branch?.chapters??tree?.branches??[];

  const refresh=useCallback(async()=>{
    if(!yearId||!gradeId)return;
    try{
      const response=await loadCurriculum({academicYearId:yearId,gradeId});
      setTree(response.curriculum);
      setSelection(current=>{
        const branch=response.curriculum.branches.find(item=>item.id===current.branch?.id);
        const chapter=branch?.chapters.find(item=>item.id===current.chapter?.id);
        const lesson=chapter?.lessons.find(item=>item.id===current.lesson?.id);
        return {branch,chapter,lesson};
      });
    }catch(error){notify(error instanceof ApiError?error.message:"تعذر تحميل المحتوى","error");}
  },[yearId,gradeId]);

  useEffect(()=>{Promise.all([loadAcademicYears(),loadGrades()]).then(([yearData,gradeData])=>{
    setYears(yearData.academic_years);setGrades(gradeData.grades);
    setYearId(yearData.academic_years.find(year=>year.status==="active")?.id??yearData.academic_years[0]?.id??0);
    setGradeId(gradeData.grades[0]?.id??0);
  });},[]);
  useEffect(()=>{setSelection({});void refresh();},[yearId,gradeId,refresh]);

  const parentInput=():Record<string,number>=>level==="branches"?{academic_year_id:yearId,grade_id:gradeId}:level==="chapters"?{branch_id:selection.branch!.id}:level==="lessons"?{chapter_id:selection.chapter!.id}:{lesson_id:selection.lesson!.id};
  const save=async()=>{try{
    const wasEditing=editingId!==null;
    if(editingId)await updateContent(level,editingId,{title});else await createContent(level,{...parentInput(),title,status:"draft"});
    setModal(false);setTitle("");setEditingId(null);await refresh();notify(wasEditing?"تم تعديل العنصر":"تمت إضافة العنصر","success");
  }catch(error){notify(error instanceof ApiError?error.message:"تعذر حفظ العنصر","error");}};
  const changeStatus=async(id:number,status:ContentStatus)=>{await updateContent(level,id,{status});await refresh();notify("تم تحديث حالة النشر","success");};
  const remove=async(id:number)=>{try{await deleteContent(level,id);await refresh();notify("تم حذف العنصر","success");}catch(error){notify(error instanceof ApiError&&error.status===409?"احذف المحتوى الموجود داخله أولًا":"تعذر حذف العنصر","error");}};
  const move=async(id:number,direction:-1|1)=>{const index=items.findIndex(item=>item.id===id);const target=index+direction;if(target<0||target>=items.length)return;const ids=items.map(item=>item.id);[ids[index],ids[target]]=[ids[target],ids[index]];await reorderContent(level,parentInput(),ids);await refresh();};
  const enter=(item:Branch|Chapter|Lesson)=>setSelection(current=>level==="branches"?{branch:item as Branch}:level==="chapters"?{...current,chapter:item as Chapter}:level==="lessons"?{...current,lesson:item as Lesson}:current);
  const back=()=>setSelection(current=>current.lesson?{branch:current.branch,chapter:current.chapter}:current.chapter?{branch:current.branch}:{});
  const heading=selection.lesson?.title??selection.chapter?.title??selection.branch?.title??"إدارة المحتوى";

  return <div className="min-h-screen bg-background p-4 sm:p-6"><div className="mx-auto max-w-5xl">
    <div className="mb-5 flex items-center justify-between gap-3"><div>{selection.branch&&<button onClick={back} className="mb-2 flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft size={14}/> رجوع</button>}<h1 className="text-2xl font-black">{heading}</h1></div><Btn onClick={()=>{setEditingId(null);setTitle("");setModal(true);}}><Plus size={15}/> إضافة</Btn></div>
    <Card2 className="mb-4"><div className="grid gap-3 sm:grid-cols-2"><Select2 label="السنة الدراسية" value={String(yearId)} onChange={(event:any)=>setYearId(Number(event.target.value))} options={years.map(year=>({value:String(year.id),label:year.name}))}/><Select2 label="الصف" value={String(gradeId)} onChange={(event:any)=>setGradeId(Number(event.target.value))} options={grades.map(grade=>({value:String(grade.id),label:gradeLabel(grade)}))}/></div></Card2>
    <div className="space-y-3">{items.map((item,index)=><Card2 key={item.id}><div className="flex items-center gap-3">
      <div className="flex flex-col"><button aria-label="تحريك لأعلى" disabled={index===0} onClick={()=>move(item.id,-1)}><ChevronUp size={16}/></button><button aria-label="تحريك لأسفل" disabled={index===items.length-1} onClick={()=>move(item.id,1)}><ChevronDown size={16}/></button></div>
      {level==="lectures"?<Video className="text-primary"/>:<BookOpen className="text-primary"/>}
      <button className="flex-1 text-right" onClick={()=>enter(item as Branch|Chapter|Lesson)}><strong>{item.title}</strong><div className="mt-1 flex gap-2"><Badge2 variant={item.status==="published"?"success":"default"}>{statusLabel[item.status]}</Badge2>{level==="lectures"&&<Badge2 variant={(item as any).video_asset?.processing_status==="ready"?"success":"default"}>{videoStatusLabel((item as any).video_asset?.processing_status)}</Badge2>}</div></button>
      <div className="flex gap-2">{level==="lectures"&&<button title="رفع فيديو" onClick={()=>setUploadLecture({id:item.id,title:item.title})}><Upload size={16}/></button>}<button title="تعديل" onClick={()=>{setEditingId(item.id);setTitle(item.title);setModal(true);}}><Edit2 size={16}/></button><button title="نشر" onClick={()=>changeStatus(item.id,"published")}><BookOpen size={16}/></button><button title="إخفاء" onClick={()=>changeStatus(item.id,"hidden")}><EyeOff size={16}/></button><button title="أرشفة" onClick={()=>changeStatus(item.id,"archived")}><Archive size={16}/></button><button title="حذف" onClick={()=>remove(item.id)}><Trash2 size={16} className="text-red-500"/></button></div>
    </div></Card2>)}{items.length===0&&<Card2><p className="py-8 text-center text-muted-foreground">لا يوجد محتوى في هذا المستوى</p></Card2>}</div>
    <Modal2 open={modal} onClose={()=>setModal(false)} title={editingId?"تعديل المحتوى":"إضافة محتوى"}><div className="space-y-4"><Input2 label="العنوان" value={title} onChange={event=>setTitle(event.target.value)}/><Btn className="w-full" disabled={!title.trim()} onClick={save}>{editingId?"حفظ التعديل":"حفظ كمسودة"}</Btn></div></Modal2>
    {uploadLecture&&<VideoUploadModal lecture={uploadLecture} onClose={()=>setUploadLecture(null)} onReady={refresh}/>}
  </div></div>;
}
