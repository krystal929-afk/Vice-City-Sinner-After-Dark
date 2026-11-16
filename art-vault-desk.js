/* VCS Art Vault / local image library and independent edition collections. */
(function(){
"use strict";
const $=id=>document.getElementById(id), db=window.VCS_ART_DB;
const slots=window.VCS_ART_SLOTS||[], byId=new Map(slots.map(s=>[s.id,s]));
const published=window.VCS_ARTWORK||{placements:{},images:{}};
const frame=$("site-preview"), pageSelect=$("preview-page");
const maxFile=8*1024*1024,maxPack=64*1024*1024;
const validData=s=>typeof s==="string"&&s.length<=Math.ceil(maxFile*4/3)+100&&/^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(s);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
const validId=s=>typeof s==="string"&&/^[a-zA-Z0-9_-]{1,100}$/.test(s)&&!["__proto__","constructor","prototype"].includes(s);
const clamp=v=>Number.isFinite(Number(v))?Math.max(0,Math.min(100,Number(v))):50;
let library={},placements={},collections=[],currentSlot="",selectedImage="",picking=false,activePage="index.html";
let queue=Promise.resolve();
function status(message){$("art-status").textContent=message}
function persist(){
 const snapshot={images:{...library},placements:{...placements}};
 queue=queue.catch(()=>{}).then(()=>db.write("working",snapshot));
 queue.catch(()=>status("Browser storage is full or unavailable. Export this artwork pack before leaving."));
 return queue;
}
function send(){
 try{frame.contentWindow.postMessage({type:"vcs-art-preview",pack:{placements,images:library},picking,selected:currentSlot},location.origin)}catch(_){}
}
function safePack(input){
 if(!input||typeof input!=="object")throw Error("Invalid artwork pack.");
 const images={},out={};
 for(const [id,asset] of Object.entries(input.images||{})){
  if(validId(id)&&asset&&validData(asset.data))images[id]={name:String(asset.name||"Artwork").slice(0,180),data:asset.data,createdAt:String(asset.createdAt||"")};
 }
 for(const [id,p] of Object.entries(input.placements||{})){
  if(!byId.has(id)||!p)continue;
  if(p.restore===true){out[id]={restore:true};continue}
  if(!validId(p.imageId)||!own(images,p.imageId))continue;
  out[id]={imageId:p.imageId,alt:String(p.alt||"").slice(0,300),x:clamp(p.x),y:clamp(p.y),fit:p.fit==="contain"?"contain":"cover",crop:["original","square","portrait","landscape","wide"].includes(p.crop)?p.crop:"original"};
 }
 return {images,placements:out};
}
function currentPlacement(){return own(placements,currentSlot)?placements[currentSlot]:published.placements?.[currentSlot]}
function assetFor(id){return library[id]||published.images?.[id]}
function renderSlots(){
 const select=$("art-slot"),pageSlots=slots.filter(s=>s.page===activePage);
 select.replaceChildren();
 for(const s of pageSlots){const o=document.createElement("option");o.value=s.id;o.textContent=s.label.slice(0,100);select.append(o)}
 if(!pageSlots.length){const o=document.createElement("option");o.value="";o.textContent="No artwork on this page";select.append(o)}
 if(!pageSlots.some(s=>s.id===currentSlot))currentSlot=pageSlots[0]?.id||"";
 select.value=currentSlot;
}
function chooseSlot(id){
 if(!byId.has(id))return;
 currentSlot=id;
 const p=currentPlacement();
 selectedImage=p&&!p.restore?p.imageId:"";
 renderSlots();renderLibrary();renderEditor();send();
}
function renderLibrary(){
 const panel=$("art-library");panel.replaceChildren();
 const all={...(published.images||{}),...library};
 $("art-count").textContent=Object.keys(all).length+" image"+(Object.keys(all).length===1?"":"s");
 if(!Object.keys(all).length){const e=document.createElement("p");e.className="vault-empty";e.textContent="No artwork yet. Upload an original or an approved photograph to begin.";panel.append(e);return}
 for(const [id,a] of Object.entries(all).reverse()){
  const btn=document.createElement("button");btn.type="button";btn.className="vault-asset";
  btn.classList.toggle("is-selected",selectedImage===id);
  btn.setAttribute("aria-pressed",String(selectedImage===id));
  const img=document.createElement("img");img.src=a.data;img.alt="";img.loading="lazy";
  const title=document.createElement("span");title.textContent=a.name;title.title=a.name;
  btn.append(img,title);
  btn.addEventListener("click",()=>{if(selectedImage!==id)$("art-alt").value="";selectedImage=id;renderLibrary();renderEditor(false);status("Selected "+a.name+". Choose Place artwork to apply it.")});
  panel.append(btn);
 }
}
function renderEditor(reset=true){
 const slot=byId.get(currentSlot),p=currentPlacement(),asset=assetFor(selectedImage);
 const img=$("art-current-img"),empty=$("art-empty");
 let src=asset?.data||slot?.src||"";
 if(src){img.src=src;img.hidden=false;empty.hidden=true}else{img.removeAttribute("src");img.hidden=true;empty.hidden=false}
 $("art-current-name").textContent=asset?.name||"Original artwork";
 $("art-current-status").textContent=p&&!p.restore?"Replacement placed in this location.":"Choose artwork from the library.";
 $("art-original-note").textContent=slot?.kind==="decoration"?"Optional illustration slot. Leaving it empty preserves the original design.":slot?"Original photo: "+slot.label:"Choose a page with artwork.";
 if(reset){
  $("art-alt").value=p&&!p.restore?p.alt||"":"";
  $("art-crop").value=p?.crop||"original";
  $("art-fit").value=p?.fit||"cover";
  $("art-x").value=p?.x??50;$("art-y").value=p?.y??50;
 }
 $("art-apply").disabled=!slot||!asset;
 $("art-restore").disabled=!slot;
 $("art-x-value").textContent=$("art-x").value+"%";$("art-y-value").textContent=$("art-y").value+"%";
}
function refreshPage(page){
 if(!page)return;activePage=page;
 if(Array.from(pageSelect.options).some(o=>o.value===page))pageSelect.value=page;
 renderSlots();if(currentSlot)chooseSlot(currentSlot);else{selectedImage="";renderLibrary();renderEditor();send()}
}
function putPlacement(){
 if(!byId.has(currentSlot)||!assetFor(selectedImage))return;
 const slot=byId.get(currentSlot);
 const alt=$("art-alt").value.trim();
 if(slot.kind!=="decoration"&&!alt){status("Describe the replacement image before placing it, so the original photo is not mislabeled.");$("art-alt").focus();return}
 if(!own(library,selectedImage)){const a=assetFor(selectedImage);if(a)library[selectedImage]=a}
 placements[currentSlot]={imageId:selectedImage,alt,x:Number($("art-x").value),y:Number($("art-y").value),fit:$("art-fit").value,crop:$("art-crop").value};
 persist();send();renderEditor(false);status("Artwork placed in the proof. Original preserved. Not published.");
}
function tweak(){
 $("art-x-value").textContent=$("art-x").value+"%";$("art-y-value").textContent=$("art-y").value+"%";
 const p=currentPlacement();
 if(p&&!p.restore&&p.imageId===selectedImage){
  // Only adjust an already placed image. A new candidate is not applied without a click.
  placements[currentSlot]={...p,x:Number($("art-x").value),y:Number($("art-y").value),fit:$("art-fit").value,crop:$("art-crop").value};
  persist();send();
 }
}
function makeId(){return "art-"+(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+"-"+Math.random().toString(36).slice(2))}
function readFile(file){
 return new Promise((res,rej)=>{const reader=new FileReader();reader.onload=()=>res(reader.result);reader.onerror=()=>rej(reader.error);reader.readAsDataURL(file)});
}
async function upload(files){
 let count=0,skipped=0;
 for(const file of files){
  if(!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)||file.size>maxFile){skipped++;continue}
  try{const data=await readFile(file);if(!validData(data)){skipped++;continue}
   const id=makeId();library[id]={name:file.name.slice(0,180),data,createdAt:new Date().toISOString()};selectedImage=id;$("art-alt").value="";count++;
  }catch(_){skipped++}
 }
 try{await persist();renderLibrary();renderEditor(false);status(count+" image(s) added to the vault."+(skipped?" "+skipped+" unsupported or oversized file(s) skipped.":""))}catch(_){renderLibrary();renderEditor(false);status("Artwork is available in this session only; export a pack to retain it.")}
}
function currentPack(){
 const images={},out={...(published.placements||{}),...placements};
 for(const p of Object.values(out)){
  if(p&&!p.restore&&assetFor(p.imageId))images[p.imageId]=assetFor(p.imageId);
 }
 return {format:"vcs-artwork-pack",version:1,name:$("art-collection-name").value.trim().slice(0,64)||"Untitled artwork collection",createdAt:new Date().toISOString(),placements:out,images};
}
function download(name,data,type){
 const url=URL.createObjectURL(new Blob([data],{type}));
 const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function exportPack(pack){
 const file=JSON.stringify(pack,null,2);
 if(file.length>maxPack){status("Artwork pack exceeds the 64 MB import limit. Reduce the collection size before export.");return}
 const name=String(pack.name||"collection").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"collection";
 download("vcs-"+name+"-artwork.json",file,"application/json");status("Artwork pack exported with the assigned images. Not published.");
}
function renderCollections(){
 const el=$("art-collections");el.replaceChildren();
 if(!collections.length){const p=document.createElement("p");p.className="vault-hint";p.textContent="No saved artwork collections yet.";el.append(p);return}
 collections.forEach((c,i)=>{
  const row=document.createElement("div");row.className="vault-collection-row";
  const left=document.createElement("div"),title=document.createElement("strong"),small=document.createElement("small");
  title.textContent=c.name;small.textContent=Object.keys(c.placements||{}).length+" placements";left.append(title,small);
  const actions=document.createElement("div");
  const load=document.createElement("button");load.className="action";load.type="button";load.textContent="Load";
  load.onclick=()=>{loadCollection(c);status("Collection loaded: "+c.name)};
  const exp=document.createElement("button");exp.className="action";exp.type="button";exp.textContent="↓";exp.setAttribute("aria-label","Export "+c.name);exp.onclick=()=>exportPack(c);
  const del=document.createElement("button");del.className="action";del.type="button";del.textContent="×";del.setAttribute("aria-label","Delete "+c.name);del.onclick=async()=>{if(!confirm("Remove this saved collection? Uploaded images remain in the library."))return;collections.splice(i,1);try{await db.write("collections",collections);renderCollections();status("Collection removed.")}catch(_){status("Could not update saved collections.")}};
  actions.append(load,exp,del);row.append(left,actions);el.append(row);
 });
}
function loadCollection(pack){
 const clean=safePack(pack);
 // Each pack describes a full edition, not merely additions.
 placements={};for(const id of Object.keys(published.placements||{}))if(!own(clean.placements,id))placements[id]={restore:true};
 Object.assign(placements,clean.placements);Object.assign(library,clean.images);
 $("art-collection-name").value=String(pack.name||"").slice(0,64);
 persist();renderSlots();chooseSlot(currentSlot);renderCollections();send();
}
async function init(){
 try{
  const working=await db.read("working");
  if(working){const clean=safePack(working);library=clean.images;placements=clean.placements}
  collections=(await db.read("collections"))||[];if(!Array.isArray(collections))collections=[];
  status("The vault is ready. Your images stay on this device.")
 }catch(_){status("Local storage is unavailable. You can still upload and export artwork during this session.")}
 refreshPage(pageSelect.value||"index.html");renderCollections();
}
$("art-upload").addEventListener("change",e=>{upload(Array.from(e.target.files||[]));e.target.value=""});
$("art-slot").addEventListener("change",e=>chooseSlot(e.target.value));
$("art-pick").addEventListener("click",()=>{
 picking=!picking;$("art-pick").setAttribute("aria-pressed",String(picking));$("art-pick").textContent=picking?"Stop selecting":"Select in preview";send();
 status(picking?"Artwork selection is on. Click an outlined image in the proof.":"Artwork selection off. Links work normally.");
 if(picking){frame.scrollIntoView({block:"nearest",behavior:"smooth"})}
});
$("art-apply").addEventListener("click",putPlacement);
$("art-restore").addEventListener("click",()=>{
 if(!byId.has(currentSlot))return;
 // Explicit restore wins even if the public edition already has an override.
 placements[currentSlot]={restore:true};selectedImage="";
 persist();renderLibrary();renderEditor();send();status("Original artwork restored in this proof.");
});
for(const id of ["art-x","art-y","art-crop","art-fit"])$(id).addEventListener(id==="art-x"||id==="art-y"?"input":"change",tweak);
$("art-alt").addEventListener("change",()=>{const p=currentPlacement();if(p&&!p.restore&&p.imageId===selectedImage){const alt=$("art-alt").value.trim();if(alt||byId.get(currentSlot)?.kind==="decoration"){placements[currentSlot]={...p,alt};persist();send()}}});
$("art-save").addEventListener("click",async()=>{
 const pack=currentPack();
 if(!Object.keys(pack.placements).length){status("Place some artwork before saving a collection.");return}
 if(JSON.stringify(pack).length>maxPack){status("Collection too large to save as a portable pack.");return}
 const next=[pack,...collections].slice(0,25);
 try{await db.write("collections",next);collections=next;renderCollections();status("Artwork collection saved locally: "+pack.name)}catch(_){status("Storage unavailable. Export this collection instead.")}
});
$("art-export").addEventListener("click",()=>exportPack(currentPack()));
$("art-import").addEventListener("change",async e=>{
 const file=e.target.files?.[0];e.target.value="";if(!file)return;
 try{if(file.size>maxPack)throw Error("Pack exceeds 64 MB.");const pack=JSON.parse(await file.text());if(pack.format!=="vcs-artwork-pack"||pack.version!==1)throw Error("Not a VCS artwork pack.");loadCollection(pack);status("Imported "+String(pack.name||"artwork collection")+". Preview only.")}catch(err){status("Import failed: "+err.message)}
});
$("art-publish").addEventListener("click",()=>{
 const pack=currentPack(),payload={version:1,placements:{},images:pack.images};
 for(const [id,p] of Object.entries(pack.placements))if(!p.restore)payload.placements[id]=p;
 const data="/* Reviewed edition artwork. Replace this file only on approved release. */\nwindow.VCS_ARTWORK = "+JSON.stringify(payload,null,2)+";\n";
 if(data.length>maxPack){status("Publishing file too large. Reduce the artwork collection.");return}
 download("artwork-config.js",data,"text/javascript");status("Artwork publishing file downloaded. Commit it to staging only after review.");
});
pageSelect.addEventListener("change",()=>refreshPage(pageSelect.value));
frame.addEventListener("load",()=>{try{const page=frame.contentWindow.location.pathname.split("/").pop()||"index.html";if(slots.some(s=>s.page===page)||Array.from(pageSelect.options).some(o=>o.value===page))refreshPage(page);else send()}catch(_){send()}});
window.addEventListener("message",e=>{
 if(e.origin!==location.origin||e.source!==frame.contentWindow)return;
 if(e.data?.type==="vcs-art-ready")refreshPage(e.data.page);
 if(e.data?.type==="vcs-art-selected"&&byId.has(e.data.id)){chooseSlot(e.data.id);$("art-slot").scrollIntoView({block:"nearest",behavior:"smooth"});status("Selected image location: "+byId.get(e.data.id).label)}
});
init();
})();
