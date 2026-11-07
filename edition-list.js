document.addEventListener("DOMContentLoaded",async()=>{
 const list=document.getElementById("edition-list");
 if(!list)return;
 try{
  const result=await fetch("edition-manifest.json",{cache:"no-cache"});
  if(!result.ok)throw Error("Cannot load the edition register");
  const registry=await result.json();
  if(!Array.isArray(registry.issues)||!registry.issues.length){
   list.textContent="No past editions have been formally released yet. The cabinet is ready for the first one.";
   return;
  }
  list.replaceChildren();
  for(const issue of registry.issues){
   if(!issue||!/^[-a-z0-9]+$/.test(issue.slug||""))continue;
   const a=document.createElement("a");a.className="historical-edition";
   a.href="editions/"+issue.slug+"/index.html";
   const tag=document.createElement("span");tag.className="overline";tag.textContent="ISSUE "+String(issue.number||"")+" / "+String(issue.date||"");
   const h=document.createElement("h2");h.textContent=String(issue.name||"Untitled edition");
   const desc=document.createElement("p");desc.textContent=String(issue.description||"Preserved as originally printed.");
   const open=document.createElement("span");open.textContent="ENTER THE ORIGINAL EDITION ↗";open.className="story-link";
   a.append(tag,h,desc,open);list.append(a);
  }
 }catch(_){list.textContent="The edition register could not be opened. The story archive is still available."}
});
