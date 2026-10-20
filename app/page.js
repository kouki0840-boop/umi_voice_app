"use client";
import {useEffect,useRef,useState} from "react";
export default function Home(){
 const [msg,setMsg]=useState("マイクを押して話しかけてね");
 const [busy,setBusy]=useState(false);
 const rec=useRef(null),conv=useRef("");
 useEffect(()=>{
  conv.current=localStorage.getItem("cid")||"";
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){setMsg("音声認識に未対応です");return}
  const r=new SR();r.lang="ja-JP";
  r.onresult=e=>send(e.results[0][0].transcript);
  rec.current=r;
 },[]);
 function speak(t){
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(t);
  u.lang="ja-JP";u.pitch=1.08;u.rate=1.03;
  speechSynthesis.speak(u);
 }
 async function send(q){
  setBusy(true);setMsg("考え中…");
  try{
   const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q,conversation_id:conv.current})});
   const d=await r.json();
   if(!r.ok)throw new Error(d.error);
   conv.current=d.conversation_id||"";
   localStorage.setItem("cid",conv.current);
   setMsg(d.answer);speak(d.answer);
  }catch(e){setMsg("接続エラー: "+e.message)}
  setBusy(false);
 }
 return <main><h1>Voice Companion</h1><div className="bubble">{msg}</div><button disabled={busy} onClick={()=>rec.current?.start()}>🎙️</button><p>{busy?"返事を考えています…":"タップして話す"}</p></main>
}
