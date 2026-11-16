/* Shared artwork renderer. Published artwork is independent of browser drafts. */
(function(){
"use strict";
const root=document.documentElement;
const frozen=root.hasAttribute("data-vcs-art-frozen");
const preview=!frozen&&new URLSearchParams(location.search).get("vcs_preview")==="1";
const slots=new Map((window.VCS_ART_SLOTS||[]).map(s=>[s.id,s]));
const validData=s=>typeof s==="string"&&/^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(s);
const original=new Map();
const published=window.VCS_ARTWORK||{placements:{},images:{}};
const clamp=(v,d)=>Number.isFinite(Number(v))?Math.max(0,Math.min(100,Number(v))):d;
const cropValues={"original":"","square":"1 / 1","portrait":"3 / 4","landscape":"4 / 3","wide":"16 / 9"};
function remember(el){
 const id=el.dataset.artSlot;
 if(!original.has(id))original.set(id,{src:el.getAttribute("src"),alt:el.getAttribute("alt"),style:el.getAttribute("style"),hidden:el.hidden});
 return original.get(id);
}
function restore(el){
 const old=remember(el);
 for(const name of ["src","alt","style"]){if(old[name]===null)el.removeAttribute(name);else el.setAttribute(name,old[name])}
 el.hidden=old.hidden;
 el.classList.remove("vault-replaced","vault-cropped");
 const parent=el.closest("[data-art-container]");
 if(parent)parent.classList.remove("vault-has-art");
}
function apply(pack){
 const items={...(published.placements||{}),...(pack?.placements||{})};
 const images={...(published.images||{}),...(pack?.images||{})};
 for(const el of document.querySelectorAll("[data-art-slot]")){
  const id=el.dataset.artSlot,slot=slots.get(id);if(!slot)continue;
  restore(el);
  const p=items[id],asset=p&&images[p.imageId];
  if(!p||!asset||!validData(asset.data))continue;
  el.src=asset.data;el.alt=typeof p.alt==="string"?p.alt.slice(0,300):slot.label;
  el.hidden=false;el.classList.add("vault-replaced");
  el.style.setProperty("--vault-x",clamp(p.x,50)+"%");
  el.style.setProperty("--vault-y",clamp(p.y,50)+"%");
  el.style.setProperty("--vault-fit",p.fit==="contain"?"contain":"cover");
  const crop=cropValues[p.crop]||"";
  if(crop){el.style.setProperty("--vault-ratio",crop);el.classList.add("vault-cropped")}
  const parent=el.closest("[data-art-container]");
  if(parent)parent.classList.add("vault-has-art");
 }
}
function setPicking(on,selected){
 if(!preview)return;
 root.classList.toggle("vault-picking",!!on);
 for(const el of document.querySelectorAll("[data-art-slot]")){
  el.classList.toggle("vault-selected",!!on&&el.dataset.artSlot===selected);
 }
}
function notify(type,detail={}){
 if(preview&&window.parent!==window)window.parent.postMessage({type,...detail},location.origin);
}
window.VCS_ART_RENDER={apply,setPicking,slots:()=>Array.from(document.querySelectorAll("[data-art-slot]")).map(el=>slots.get(el.dataset.artSlot)).filter(Boolean)};
document.addEventListener("DOMContentLoaded",async()=>{
 apply(null);
 if(!preview)return;
 try{const working=await window.VCS_ART_DB.read("working");apply(working)}catch(_){}
 document.addEventListener("click",e=>{
  if(!root.classList.contains("vault-picking"))return;
  const el=e.target.closest("[data-art-slot]");
  if(!el)return;
  e.preventDefault();e.stopImmediatePropagation();notify("vcs-art-selected",{id:el.dataset.artSlot});
 },true);
 notify("vcs-art-ready",{page:location.pathname.split("/").pop()||"index.html"});
});
window.addEventListener("message",event=>{
 if(!preview||event.origin!==location.origin||event.source!==window.parent)return;
 const data=event.data;
 if(data?.type==="vcs-art-preview"){apply(data.pack);setPicking(data.picking,data.selected)}
});
})();
