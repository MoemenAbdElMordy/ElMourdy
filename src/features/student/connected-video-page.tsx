import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { ChevronRight, LoaderCircle, Shield } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import type { Navigate, Role, RouteParams } from "../../app/routing/types";
import { loadVideoPlayback, saveWatchProgress, type Playback } from "../../shared/videos/api";
import { Btn, Card2 } from "../../shared/ui";

const qualityOrder=["720p","480p","360p"];

export function ConnectedVideoPage({nav,params,role}:{nav:Navigate;params?:RouteParams;role?:Role}){
  const lectureId=Number(params?.lessonId);
  const videoRef=useRef<HTMLVideoElement>(null);
  const resumePositionRef=useRef(0);
  const [playback,setPlayback]=useState<Playback|null>(null);
  const [quality,setQuality]=useState("");
  const [error,setError]=useState("");
  const [watermarkPosition,setWatermarkPosition]=useState(0);

  useEffect(()=>{
    if(!lectureId){setError("المحاضرة المطلوبة غير موجودة");return;}
    loadVideoPlayback(lectureId).then(response=>{
      setPlayback(response.playback);
      resumePositionRef.current=response.playback.last_position_seconds;
      const available=qualityOrder.find(item=>response.playback.qualities[item])??Object.keys(response.playback.qualities)[0];
      setQuality(available??"");
    }).catch(reason=>setError(reason instanceof ApiError?reason.message:"تعذر تشغيل الفيديو"));
  },[lectureId]);

  useEffect(()=>{
    const source=playback?.qualities[quality];
    const video=videoRef.current;
    if(!source||!video)return;
    let hls:Hls|null=null;
    const restore=()=>{if(resumePositionRef.current>0&&video.currentTime<1)video.currentTime=resumePositionRef.current;};
    if(Hls.isSupported()){
      hls=new Hls({enableWorker:true});hls.loadSource(source);hls.attachMedia(video);hls.on(Hls.Events.MANIFEST_PARSED,restore);
    }else{video.src=source;video.addEventListener("loadedmetadata",restore,{once:true});}
    return()=>{resumePositionRef.current=video.currentTime;hls?.destroy();video.removeAttribute("src");video.load();};
  },[playback,quality]);

  useEffect(()=>{
    if(!playback?.watch_event_id)return;
    const save=()=>{const position=videoRef.current?.currentTime;if(position!==undefined)void saveWatchProgress(playback.watch_event_id!,position);};
    const timer=window.setInterval(save,15000);
    const video=videoRef.current;video?.addEventListener("pause",save);video?.addEventListener("ended",save);
    return()=>{window.clearInterval(timer);video?.removeEventListener("pause",save);video?.removeEventListener("ended",save);save();};
  },[playback?.watch_event_id]);

  useEffect(()=>{const timer=window.setInterval(()=>setWatermarkPosition(value=>(value+1)%4),12000);return()=>window.clearInterval(timer);},[]);

  if(role==="parent")return <CenteredMessage icon={<Shield/>} message="تشغيل الفيديو متاح للطالب فقط." onBack={()=>nav("parent-dashboard")}/>;
  if(error)return <CenteredMessage message={error} onBack={()=>nav("subjects")}/>;
  if(!playback)return <div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="animate-spin text-primary"/></div>;
  const positions=["top-6 left-6","top-6 right-6","bottom-12 left-6","bottom-12 right-6"];
  return <div className="min-h-screen bg-background p-4 sm:p-6"><div className="mx-auto max-w-5xl">
    <button onClick={()=>nav("subjects")} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground"><ChevronRight size={16}/> العودة إلى المحتوى</button>
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-xl">
      <video ref={videoRef} controls playsInline className="h-full w-full"/>
      {playback.watermark&&<div className={`pointer-events-none absolute ${positions[watermarkPosition]} rounded border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-bold text-white/35 transition-all duration-700`}>{playback.watermark.name} • {playback.watermark.phone}</div>}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-black">{playback.lecture.title}</h1>{playback.last_position_seconds>0&&<p className="mt-1 text-sm text-muted-foreground">سيبدأ الفيديو من آخر نقطة وصلت إليها.</p>}</div><label className="flex items-center gap-2 text-sm">الجودة<select aria-label="جودة الفيديو" value={quality} onChange={event=>setQuality(event.target.value)} className="rounded-xl border border-border bg-card px-3 py-2">{qualityOrder.filter(item=>playback.qualities[item]).map(item=><option key={item}>{item}</option>)}</select></label></div>
  </div></div>;
}

function CenteredMessage({message,onBack,icon}:{message:string;onBack:()=>void;icon?:React.ReactNode}){
  return <div className="flex min-h-[70vh] items-center justify-center p-4"><Card2 className="w-full max-w-md text-center">{icon&&<div className="mx-auto mb-3 flex justify-center text-muted-foreground">{icon}</div>}<p className="mb-4 font-bold">{message}</p><Btn onClick={onBack}>العودة</Btn></Card2></div>;
}
