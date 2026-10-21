"use client";
import {useEffect,useRef,useState} from "react";
export default function Home(){
 const [msg,setMsg]=useState("マイクを押して話しかけてね");
 const [busy,setBusy]=useState(false);
 const [voices,setVoices]=useState([]);
 const [voiceName,setVoiceName]=useState("");
 const [pitch,setPitch]=useState(1.08);
 const [rate,setRate]=useState(1.03);
 const rec=useRef(null),conv=useRef("");
 useEffect(()=>{
  conv.current=localStorage.getItem("cid")||"";
  const loadVoices=()=>{
   const v=speechSynthesis.getVoices().filter(x=>x.lang.startsWith("ja"));
   setVoices(v);
   if(v.length&&!voiceName)setVoiceName(v[0].name);
  };
  loadVoices();
  speechSynthesis.onvoiceschanged=loadVoices;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){setMsg("音声認識に未対応です");return}
  const r=new SR();r.lang="ja-JP";
  r.onresult=e=>send(e.results[0][0].transcript);
  rec.current=r;
 },[]);
 function speak(t){
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(t);
  u.lang="ja-JP";
  const selected=speechSynthesis.getVoices().find(v=>v.name===voiceName);
  if(selected)u.voice=selected;
  u.pitch=pitch;
  u.rate=rate;
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
 return <main><h1>Voice Companion</h1><div className="bubble">{msg}</div><div className="voice">
 <select value={voiceName} onChange={e=>setVoiceName(e.target.value)}>
  {voices.map(v=><option key={v.name} value={v.name}>{v.name}</option>)}
 </select>
 <label>声の高さ：{pitch.toFixed(2)}
  <input type="range" min="0.7" max="1.5" step="0.05"
   value={pitch} onChange={e=>setPitch(Number(e.target.value))}/>
 </label>
 <label>話す速さ：{rate.toFixed(2)}
  <input type="range" min="0.7" max="1.3" step="0.05"
   value={rate} onChange={e=>setRate(Number(e.target.value))}/>
 </label>
 <button className="test" onClick={()=>speak("こんにちは。今日もいっぱいお話ししよ？")}>
  ▶ 声を試す
 </button>
</div>
<button disabled={busy} onClick={()=>rec.current?.start()}>🎙️</button><p>{busy?"返事を考えています…":"タップして話す"}</p></main>
}
