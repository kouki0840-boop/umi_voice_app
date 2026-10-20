export async function POST(req){
 try{
  const {query,conversation_id=""}=await req.json();
  const key=process.env.DIFY_API_KEY;

  if(!key)
   return Response.json(
    {error:"DIFY_API_KEYが設定されていません"},
    {status:500}
   );

  const r=await fetch("https://api.dify.ai/v1/chat-messages",{
   method:"POST",
   headers:{
    "Authorization":`Bearer ${key}`,
    "Content-Type":"application/json"
   },
   body:JSON.stringify({
    inputs:{},
    query,
    response_mode:"blocking",
    conversation_id,
    user:"private-mobile-user"
   })
  });

  const d=await r.json();

  if(!r.ok)
   return Response.json(
    {error:d.message||"Dify API error"},
    {status:r.status}
   );

  return Response.json({
   answer:d.answer,
   conversation_id:d.conversation_id
  });

 }catch(e){
  return Response.json(
   {error:e.message},
   {status:500}
  );
 }
}
