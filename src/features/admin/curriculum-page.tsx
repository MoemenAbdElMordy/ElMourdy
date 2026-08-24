import { useCallback, useEffect, useState } from "react";
import { Archive, BookOpen, ChevronDown, ChevronLeft, ChevronUp, Edit2, EyeOff, Image, Plus, Trash2, Upload } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import { loadAcademicYears, loadGrades, type AcademicYear, type Grade } from "../../shared/admin/day5";
import { createContent, deleteContent, loadCurriculum, loadCurriculumLocations, reorderContent, updateContent, type Branch, type Chapter, type ContentStatus, type Curriculum, type CurriculumLocation, type Lecture, type Lesson, type ResourceType, type VideoAssetSummary } from "../../shared/curriculum/api";
import { deleteLectureThumbnail, uploadLectureThumbnail, useLectureThumbnailUrl } from "../../shared/media/lecture-thumbnail";
import { Badge2, Btn, Card2, Field, Input2, Modal2, Select2, notify } from "../../shared/ui";
import { VideoUploadModal } from "./video-upload-modal";
import { deleteVideoAsset } from "../../shared/videos/api";
import { VideoStoragePanel } from "./video-storage-panel";

type Selection={branch?:Branch;chapter?:Chapter;lesson?:Lesson};
type ContentItem=Branch|Chapter|Lesson|Lecture;
const gradeLabel=(grade:Grade)=>grade.level===1?"الصف الأول الثانوي":grade.level===2?"الصف الثاني الثانوي":"الصف الثالث الثانوي";
const statusLabel:Record<ContentStatus,string>={draft:"مسودة",published:"منشور",hidden:"مخفي",archived:"مؤرشف"};
const levelLabel:Record<ResourceType,string>={branches:"مادة",chapters:"باب",lessons:"درس",lectures:"محاضرة"};
const videoStatusLabel=(status?:string)=>status==="ready"?"الفيديو جاهز":status==="failed"?"فشلت المعالجة":status?"جارٍ تجهيز الفيديو":"بدون فيديو";
const lectureVideoStatusLabel=(lecture:Lecture)=>lecture.video_source_type==="youtube"&&lecture.youtube_video_id?"فيديو YouTube جاهز":videoStatusLabel(lecture.video_asset?.processing_status);

const emptyEditor={title:"",description:"",attachmentName:"",attachmentUrl:"",publishAt:"",isFree:false,additionalLessonIds:[] as number[]};

function LectureThumbnail({lecture}:{lecture:Lecture}){
  const url=useLectureThumbnailUrl(lecture.id,lecture.has_thumbnail);
  return <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">{url?<img src={url} alt="" className="h-full w-full object-cover"/>:<Image size={19} className="text-muted-foreground"/>}</div>;
}
export function CurriculumManagePage({ params }: any){
  const [years,setYears]=useState<AcademicYear[]>([]);
  const [grades,setGrades]=useState<Grade[]>([]);
  const [yearId,setYearId]=useState(0);
  const [gradeId,setGradeId]=useState(0);
  const [tree,setTree]=useState<Curriculum|null>(null);
  const [locations,setLocations]=useState<CurriculumLocation[]>([]);
  const [selection,setSelection]=useState<Selection>({});
  const [modal,setModal]=useState(false);
  const [editor,setEditor]=useState(emptyEditor);
  const [editing,setEditing]=useState<ContentItem|null>(null);
  const [thumbnailFile,setThumbnailFile]=useState<File|null>(null);
  const [removeThumbnail,setRemoveThumbnail]=useState(false);
  const [saving,setSaving]=useState(false);
  const [uploadLecture,setUploadLecture]=useState<{id:number;title:string;video_source_type?:"uploaded"|"youtube";youtube_video_id?:string|null;video_asset?:VideoAssetSummary|null}|null>(null);
  const level:ResourceType=selection.lesson?"lectures":selection.chapter?"lessons":selection.branch?"chapters":"branches";
  const items:ContentItem[]=selection.lesson?.lectures??selection.chapter?.lessons??selection.branch?.chapters??tree?.branches??[];

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
    setYearId(Number(params?.yearId) || (yearData.academic_years.find(year=>year.status==="active")?.id ?? yearData.academic_years[0]?.id ?? 0));
    setGradeId(Number(params?.gradeId) || (gradeData.grades[0]?.id ?? 0));
  });},[]);
  useEffect(()=>{loadCurriculumLocations().then(response=>setLocations(response.locations)).catch(()=>setLocations([]));},[]);
  useEffect(()=>{setSelection({});void refresh();},[yearId,gradeId,refresh]);

  const parentInput=():Record<string,number>=>level==="branches"?{academic_year_id:yearId,grade_id:gradeId}:level==="chapters"?{branch_id:selection.branch!.id}:level==="lessons"?{chapter_id:selection.chapter!.id}:{lesson_id:selection.lesson!.id};
  const openEditor=(item?:ContentItem)=>{
    const lecture=level==="lectures"&&item?item as Lecture:null;
    setEditing(item??null);
    setEditor(item?{title:item.title,description:lecture?.description??"",attachmentName:lecture?.attachment_name??"",attachmentUrl:lecture?.attachment_url??"",publishAt:item.publish_at?.slice(0,16)??"",isFree:lecture?.is_free??false,additionalLessonIds:lecture?.additional_lesson_ids??[]}:emptyEditor);
    setThumbnailFile(null);setRemoveThumbnail(false);setModal(true);
  };
  const save=async()=>{
    setSaving(true);
    try{
      const lectureFields=level==="lectures"?{description:editor.description||null,attachment_name:editor.attachmentName||null,attachment_url:editor.attachmentUrl||null,publish_at:editor.publishAt||null,is_free:editor.isFree,additional_lesson_ids:editor.additionalLessonIds}:{};
      const payload={title:editor.title,...lectureFields};
      const response=editing?await updateContent(level,editing.id,payload):await createContent(level,{...parentInput(),...payload,status:"draft"});
      const recordId=editing?.id??(response as {lecture?:Lecture}).lecture?.id;
      if(level==="lectures"&&recordId){
        if(removeThumbnail)await deleteLectureThumbnail(recordId);
        if(thumbnailFile)await uploadLectureThumbnail(recordId,thumbnailFile);
      }
      setModal(false);await refresh();notify(editing?"تم حفظ تعديلات المحاضرة":"تمت إضافة المحتوى","success");
    }catch(error){notify(error instanceof ApiError?error.message:"تعذر حفظ المحتوى","error");}
    finally{setSaving(false);}
  };
  const changeStatus=async(id:number,status:ContentStatus)=>{await updateContent(level,id,{status});await refresh();notify("تم تحديث حالة النشر","success");};
  const remove=async(id:number)=>{
    if(!window.confirm(`سيتم حذف ${levelLabel[level]} نفسه، وليس ملف الفيديو فقط. هل تريد الاستمرار؟`))return;
    try{await deleteContent(level,id);await refresh();notify(`تم حذف ${levelLabel[level]}`,"success");}
    catch(error){notify(error instanceof ApiError&&error.status===409?`لا يمكن حذف ${levelLabel[level]} قبل إزالة المحتوى والسجلات المرتبطة به`:`تعذر حذف ${levelLabel[level]}`,"error");}
  };
  const removeLectureVideo=async(lecture:Lecture)=>{
    if(!lecture.video_asset)return;
    if(!window.confirm("سيتم حذف ملف الفيديو فقط من التخزين السحابي بكل جوداته، وستظل المحاضرة موجودة. لا يمكن التراجع. هل تريد الاستمرار؟"))return;
    try{await deleteVideoAsset(lecture.video_asset.id);await refresh();notify("تم حذف ملف الفيديو فقط، والمحاضرة ما زالت موجودة","success");}
    catch(error){notify(error instanceof ApiError&&error.status===422?"هذا الفيديو مستخدم في محاضرة أخرى؛ أزل استخدامه منها أولًا":error instanceof ApiError?error.message:"تعذر حذف ملف الفيديو","error");}
  };
  const move=async(id:number,direction:-1|1)=>{const index=items.findIndex(item=>item.id===id);const target=index+direction;if(target<0||target>=items.length)return;const ids=items.map(item=>item.id);[ids[index],ids[target]]=[ids[target],ids[index]];await reorderContent(level,parentInput(),ids);await refresh();};
  const enter=(item:ContentItem)=>setSelection(current=>level==="branches"?{branch:item as Branch}:level==="chapters"?{...current,chapter:item as Chapter}:level==="lessons"?{...current,lesson:item as Lesson}:current);
  const back=()=>setSelection(current=>current.lesson?{branch:current.branch,chapter:current.chapter}:current.chapter?{branch:current.branch}:{});
  const heading=selection.lesson?.title??selection.chapter?.title??selection.branch?.title??"إدارة المحتوى";

  return <div className="min-h-screen bg-background p-4 sm:p-6"><div className="mx-auto max-w-6xl">
    <div className="mb-5 flex items-center justify-between gap-3"><div>{selection.branch&&<button onClick={back} className="mb-2 flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft size={14}/> رجوع</button>}<h1 className="text-2xl font-black">{heading}</h1><p className="mt-1 text-sm text-muted-foreground">إدارة {levelLabel[level]} وترتيبها وما يظهر منها للطالب</p></div><Btn onClick={()=>openEditor()}><Plus size={15}/> إضافة {levelLabel[level]}</Btn></div>
    <Card2 className="mb-4"><Select2 label="السنة الدراسية" value={String(yearId)} onChange={(event:any)=>setYearId(Number(event.target.value))} options={years.map(year=>({value:String(year.id),label:year.name}))}/><div className="mt-4"><p className="mb-2 text-sm font-bold">اختر الصف ثم أدِر فروعه ومحتواه</p><div className="grid gap-3 sm:grid-cols-3">{grades.map(grade=><button key={grade.id} type="button" onClick={()=>setGradeId(grade.id)} className={`rounded-2xl border p-4 text-right transition ${gradeId===grade.id?"border-primary bg-primary text-primary-foreground shadow-md":"border-border bg-background hover:border-primary/60"}`}><BookOpen className="mb-3" size={22}/><strong>{gradeLabel(grade)}</strong><span className="mt-1 block text-xs opacity-80">النحو والبلاغة والأدب وباقي الفروع</span></button>)}</div></div></Card2>
    <VideoStoragePanel onChange={refresh}/>
    <div className="space-y-3">{items.map((item,index)=>{const lecture=level==="lectures"?item as Lecture:null;return <Card2 key={item.id}><div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-col"><button aria-label="تحريك لأعلى" disabled={index===0} onClick={()=>move(item.id,-1)}><ChevronUp size={16}/></button><button aria-label="تحريك لأسفل" disabled={index===items.length-1} onClick={()=>move(item.id,1)}><ChevronDown size={16}/></button></div>
      {lecture?<LectureThumbnail lecture={lecture}/>:<BookOpen className="text-primary"/>}
      <button className="min-w-48 flex-1 text-right" onClick={()=>enter(item)}><strong>{item.title}</strong><div className="mt-1 flex flex-wrap gap-2"><Badge2 variant={item.status==="published"?"success":"default"}>{statusLabel[item.status]}</Badge2>{lecture&&<><Badge2 variant={(lecture.video_source_type==="youtube"&&lecture.youtube_video_id)||lecture.video_asset?.processing_status==="ready"?"success":"default"}>{lectureVideoStatusLabel(lecture)}</Badge2>{lecture.is_free&&<Badge2 variant="info">مجانية</Badge2>}</>}</div>{lecture?.description&&<p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{lecture.description}</p>}</button>
      <div className="flex flex-wrap gap-2">{lecture&&<><Btn size="sm" variant="outline" onClick={()=>setUploadLecture({id:lecture.id,title:lecture.title,video_source_type:lecture.video_source_type,youtube_video_id:lecture.youtube_video_id,video_asset:lecture.video_asset})}><Upload size={14}/> إدارة الفيديو</Btn>{lecture.video_asset&&<Btn size="sm" variant="danger" onClick={()=>removeLectureVideo(lecture)}><Trash2 size={14}/> حذف الفيديو فقط</Btn>}</>}<button title="تعديل" onClick={()=>openEditor(item)}><Edit2 size={16}/></button><button title="نشر" onClick={()=>changeStatus(item.id,"published")}><BookOpen size={16}/></button><button title="إخفاء" onClick={()=>changeStatus(item.id,"hidden")}><EyeOff size={16}/></button><button title="أرشفة" onClick={()=>changeStatus(item.id,"archived")}><Archive size={16}/></button><button title={`حذف ${levelLabel[level]} نفسه`} aria-label={`حذف ${levelLabel[level]} نفسه`} onClick={()=>remove(item.id)}><Trash2 size={16} className="text-red-500"/></button></div>
    </div></Card2>;})}{items.length===0&&<Card2><p className="py-8 text-center text-muted-foreground">لا يوجد محتوى في هذا المستوى</p></Card2>}</div>
    <Modal2 open={modal} onClose={()=>setModal(false)} title={editing?`تعديل ${levelLabel[level]}`:`إضافة ${levelLabel[level]}`} size={level==="lectures"?"lg":"md"} onSubmit={save}><div className="space-y-4"><Input2 label="العنوان" value={editor.title} onChange={event=>setEditor(value=>({...value,title:event.target.value}))}/>{level==="lectures"&&<><Field label="وصف المحاضرة"><textarea rows={4} value={editor.description} onChange={event=>setEditor(value=>({...value,description:event.target.value}))} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="اكتب ما سيتعلمه الطالب في هذه المحاضرة"/></Field><div className="grid gap-3 sm:grid-cols-2"><Input2 label="اسم الملف المرفق" value={editor.attachmentName} onChange={event=>setEditor(value=>({...value,attachmentName:event.target.value}))} placeholder="مذكرة المحاضرة"/><Input2 label="رابط الملف المرفق" type="url" dir="ltr" value={editor.attachmentUrl} onChange={event=>setEditor(value=>({...value,attachmentUrl:event.target.value}))} placeholder="https://..."/></div><div className="grid gap-3 sm:grid-cols-2"><Input2 label="موعد النشر (اختياري)" type="datetime-local" value={editor.publishAt} onChange={event=>setEditor(value=>({...value,publishAt:event.target.value}))}/><label className="flex items-center gap-2 self-end rounded-xl border border-border p-3 text-sm"><input type="checkbox" checked={editor.isFree} onChange={event=>setEditor(value=>({...value,isFree:event.target.checked}))}/> محاضرة مجانية</label></div><Field label="أماكن إضافية للمحاضرة"><p className="mb-2 text-xs text-muted-foreground">اختر أي دروس أخرى تريد أن تظهر فيها المحاضرة نفسها. لن يُرفع الفيديو أو يُعالج مرة أخرى.</p><div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-border p-3">{locations.filter(location=>location.lesson_id!==selection.lesson?.id).map(location=><label key={location.lesson_id} className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={editor.additionalLessonIds.includes(location.lesson_id)} onChange={event=>setEditor(value=>({...value,additionalLessonIds:event.target.checked?[...value.additionalLessonIds,location.lesson_id]:value.additionalLessonIds.filter(id=>id!==location.lesson_id)}))}/><span><strong>{location.academic_year} — {gradeLabel({id:0,name:location.grade,level:location.grade_level})}</strong><br/><span className="text-xs text-muted-foreground">{location.branch} / {location.chapter} / {location.lesson}</span></span></label>)}</div></Field><Field label="صورة المحاضرة"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>{setThumbnailFile(event.target.files?.[0]??null);setRemoveThumbnail(false);}} className="block w-full rounded-xl border border-border bg-background p-3 text-sm"/>{editing&&(editing as Lecture).has_thumbnail&&<label className="mt-2 flex items-center gap-2 text-sm text-red-600"><input type="checkbox" checked={removeThumbnail} onChange={event=>{setRemoveThumbnail(event.target.checked);if(event.target.checked)setThumbnailFile(null);}}/> حذف الصورة الحالية</label>}<p className="mt-1 text-xs text-muted-foreground">الأبعاد الموصى بها: 1280 × 720 بكسل بنسبة 16:9.</p><p className="mt-1 text-xs text-muted-foreground">JPG أو PNG أو WebP، بحد أقصى 5 ميجابايت.</p></Field></>}<Btn type="submit" className="w-full" disabled={!editor.title.trim()||saving}>{saving?"جارٍ الحفظ…":editing?"حفظ التعديلات":"حفظ كمسودة"}</Btn></div></Modal2>
    {uploadLecture&&<VideoUploadModal lecture={uploadLecture} existingAsset={uploadLecture.video_asset} onClose={()=>setUploadLecture(null)} onReady={refresh}/>}
  </div></div>;
}
