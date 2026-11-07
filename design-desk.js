(function(){
"use strict";
const catalog=window.VCS_PUBLICATION;
if(!catalog)throw new Error("Publication settings unavailable");
const $=id=>document.getElementById(id);
const storage="vcs-design-drafts-v1";
const engineStorage="vcs-edition-settings-v1";
const options={broadsheet:true,folio:true,poster:true};
const densities={classic:true,compact:true,airy:true};
const faces={newspaper:true,deco:true,condensed:true};
const themeValid=x=>Object.prototype.hasOwnProperty.call(catalog.themes,x);
const colorValid=x=>typeof x==="string"&&/^#[\da-fA-F]{6}$/.test(x);
const d=catalog.defaultSettings;
let state={theme:catalog.defaultTheme,layout:d.layout,density:d.density,headlines:d.headlines,accent:d.accent};
function cleaned(x){
 const theme=themeValid(x.theme)?x.theme:catalog.defaultTheme;
 return {
  theme,
  layout:options[x.layout]?x.layout:"broadsheet",
  density:densities[x.density]?x.density:"classic",
  headlines:faces[x.headlines]?x.headlines:"newspaper",
  accent:colorValid(x.accent)?x.accent:catalog.themes[theme].defaultAccent
 };
}
let currentUrl="";
function previewUrl(){
 const u=new URL("index.html",location.href);
 u.searchParams.set("vcs_preview","1");
 for(const [key,param] of [["theme","vcs_theme"],["layout","vcs_layout"],["density","vcs_density"],["headlines","vcs_headlines"],["accent","vcs_accent"]])
   u.searchParams.set(param,state[key]);
 return u.href;
}
function feedback(msg){$("status").textContent=msg}
function render(){
 state=cleaned(state);
 for(const button of document.querySelectorAll("[data-theme]")){
  const on=button.dataset.theme===state.theme;
  button.classList.toggle("is-selected",on);
  button.setAttribute("aria-pressed",String(on));
 }
 for(const key of ["layout","density","headlines","accent"])$(key).value=state[key];
 $("accent-label").value=state.accent.toUpperCase();
 $("preview-title").textContent=catalog.themes[state.theme].label;
 const u=previewUrl();
 if(currentUrl!==u){$("site-preview").src=u;currentUrl=u}
}
document.querySelectorAll("[data-theme]").forEach(button=>button.addEventListener("click",()=>{
 state.theme=button.dataset.theme;
 state.accent=catalog.themes[state.theme].defaultAccent;
 render();
 feedback("Previewing "+catalog.themes[state.theme].label+". Not published.");
}));
for(const key of ["layout","density","headlines"]){
 $(key).addEventListener("change",()=>{state[key]=$(key).value;render();feedback("Preview updated. Not published.")});
}
$("accent").addEventListener("input",()=>{state.accent=$("accent").value;render();feedback("Ink color updated. Not published.")});
$("open-preview").addEventListener("click",()=>window.open(previewUrl(),"_blank","noopener,noreferrer"));
function drafts(){
 try{const a=JSON.parse(localStorage.getItem(storage)||"[]");return Array.isArray(a)?a:[]}catch(_){return []}
}
function writeDrafts(a){
 try{localStorage.setItem(storage,JSON.stringify(a));return true}catch(_){feedback("Storage unavailable. Export a design pack instead.");return false}
}
function snapshot(){
 const name=($("draft-name").value||"Untitled edition").trim().slice(0,64);
 return {format:"vcs-design-pack",version:1,name,createdAt:new Date().toISOString(),design:{...state},publication:"Vice City Sinner",stage:"draft"};
}
function download(name,contents,mime){
 const blob=new Blob([contents],{type:mime});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),500);
}
function safeFileName(name){
 return (name||"untitled-edition").normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,45)||"untitled-edition";
}
function exportPack(pack){
 download("vcs-"+safeFileName(pack.name)+"-design.json",JSON.stringify(pack,null,2)+"\n","application/json");
}
function renderDrafts(){
 const list=$("draft-list"),arr=drafts();
 list.replaceChildren();
 if(!arr.length){const p=document.createElement("p");p.className="empty-drafts";p.textContent="No saved designs in this browser yet.";list.append(p);return}
 arr.forEach((entry,i)=>{
  const row=document.createElement("div");row.className="draft-item";
  const title=document.createElement("div");
  const strong=document.createElement("strong");strong.textContent=entry.name||"Untitled edition";
  const small=document.createElement("small");small.textContent=(catalog.themes[entry.design?.theme]?.label||"Design")+(entry.createdAt?" · "+entry.createdAt.slice(0,10):"");
  title.append(strong,small);
  const actions=document.createElement("div");actions.className="draft-item-actions";
  const use=document.createElement("button");use.type="button";use.textContent="Load";
  use.addEventListener("click",()=>{state=cleaned(entry.design||{});$("draft-name").value=entry.name||"";render();feedback("Draft loaded for preview.")});
  const save=document.createElement("button");save.type="button";save.textContent="↓";save.setAttribute("aria-label","Download "+entry.name);
  save.addEventListener("click",()=>exportPack(entry));
  const del=document.createElement("button");del.type="button";del.textContent="×";del.setAttribute("aria-label","Delete "+entry.name);
  del.addEventListener("click",()=>{const all=drafts();all.splice(i,1);writeDrafts(all);renderDrafts();feedback("Draft removed from this browser.")});
  actions.append(use,save,del);row.append(title,actions);list.append(row);
 });
}
$("save-draft").addEventListener("click",()=>{
 const item=snapshot(),all=drafts();
 all.unshift(item);
 if(writeDrafts(all.slice(0,40))){renderDrafts();feedback("Saved in this browser. Download a pack for a lasting backup.")}
});
$("export-draft").addEventListener("click",()=>{exportPack(snapshot());feedback("Design pack downloaded. It has not been published.")});
$("import-pack").addEventListener("change",async evt=>{
 const file=evt.target.files?.[0];if(!file)return;
 try{
  if(file.size>50000)throw Error("File is too large");
  const obj=JSON.parse(await file.text());
  if(obj.format!=="vcs-design-pack"||!obj.design||!themeValid(obj.design.theme))throw Error("Not a VCS design pack");
  state=cleaned(obj.design);
  $("draft-name").value=String(obj.name||"Imported edition").slice(0,64);
  render();
  feedback("Imported "+$("draft-name").value+". Preview only.");
 }catch(e){feedback("Import failed: "+e.message)}
 evt.target.value="";
});
$("use-local").addEventListener("click",()=>{
 try{localStorage.setItem(engineStorage,JSON.stringify(state));feedback("This design now appears across the newspaper on this device only.")}
 catch(_){feedback("Your browser did not permit local design preferences.")}
});
$("reset-local").addEventListener("click",()=>{
 try{localStorage.removeItem(engineStorage)}catch(_){}
 state={theme:catalog.defaultTheme,...catalog.defaultSettings};
 render();
 feedback("Restored to the publication's default design on this device.");
});
$("export-publish").addEventListener("click",()=>{
 const next=JSON.parse(JSON.stringify(catalog));
 next.defaultTheme=state.theme;
 next.defaultSettings={layout:state.layout,density:state.density,headlines:state.headlines,accent:state.accent};
 const file="/* VCS PUBLICATION SETTINGS. Replaces publication-config.js in STAGING on release. */\nwindow.VCS_PUBLICATION = "+JSON.stringify(next,null,2)+";\n";
 download("publication-config.js",file,"text/javascript");
 feedback("Publishing file downloaded. It is NOT live until committed to the staging repository.");
});
render();renderDrafts();
})();
