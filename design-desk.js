(function(){
"use strict";
const catalog=window.VCS_PUBLICATION;
if(!catalog)throw new Error("Publication settings unavailable");
const $=id=>document.getElementById(id);
const storage="vcs-design-drafts-v1";
const engineStorage="vcs-edition-settings-v1";
const options={broadsheet:true,folio:true,poster:true,editorial:true,gallery:true};
const densities={classic:true,compact:true,airy:true};
const faces={newspaper:true,deco:true,condensed:true,slab:true,italic:true};
const additional={masthead:["heritage","deco","whisper","brutalist","stacked"],photos:["archival","truecolor","washed","contrast","tint"],paper:["newsprint","clean","weathered","folded"],rules:["classic","hairline","heavy","dashed"],copySize:["small","standard","large","oversize"]};
const themeValid=x=>Object.prototype.hasOwnProperty.call(catalog.themes,x);
const colorValid=x=>typeof x==="string"&&/^#[\da-fA-F]{6}$/.test(x);
const d=catalog.defaultSettings;
let state={theme:catalog.defaultTheme,...d};
let lastSurprise=null;
function cleaned(x){
 const theme=themeValid(x.theme)?x.theme:catalog.defaultTheme;
 return {
  theme,
  layout:options[x.layout]?x.layout:"broadsheet",
  density:densities[x.density]?x.density:"classic",
  headlines:faces[x.headlines]?x.headlines:"newspaper",
  accent:colorValid(x.accent)?x.accent:catalog.themes[theme].defaultAccent,
  ...Object.fromEntries(Object.entries(additional).map(([key,values])=>[key,values.includes(x[key])?x[key]:(values.includes(d[key])?d[key]:values[0])]))
 };
}
let currentUrl="";
function previewUrl(){
 const u=new URL($("preview-page").value||"index.html",location.href);
 u.searchParams.set("vcs_preview","1");
 for(const [key,param] of [["theme","vcs_theme"],["layout","vcs_layout"],["density","vcs_density"],["headlines","vcs_headlines"],["accent","vcs_accent"],...Object.keys(additional).map(key=>[key,"vcs_"+key])])
   u.searchParams.set(param,state[key]);
 return u.href;
}
function feedback(msg){$("status").textContent=msg}
const swatchClasses={"other-edition":"swatch-paper","blue-hour":"swatch-blue","black-letter":"swatch-black","velvet-vice":"swatch-velvet","acid-riviera":"swatch-acid","sunday-strange":"swatch-sunday"};
const themeSubtitles={"other-edition":"Uncanny broadsheet","blue-hour":"Sea-glass / dreamlike","black-letter":"Midnight tabloid","velvet-vice":"Plum / gothic couture","acid-riviera":"Black / acid ink","sunday-strange":"Bleached / quietly wrong"};
const themeChoices=$("theme-choices");
themeChoices.replaceChildren();
for(const [key,theme] of Object.entries(catalog.themes)){
 const button=document.createElement("button");button.type="button";button.className="theme-card";button.dataset.theme=key;button.setAttribute("aria-pressed","false");
 const swatch=document.createElement("span");swatch.className="theme-swatch "+(swatchClasses[key]||"swatch-paper");
 const ink=document.createElement("span");ink.className="swatch-paper-lines";ink.innerHTML="VICE CITY<br>SINNER";swatch.append(ink);
 const info=document.createElement("span");info.className="theme-info";
 const name=document.createElement("strong");name.textContent=theme.label;
 const subtitle=document.createElement("small");subtitle.textContent=themeSubtitles[key]||theme.description;
 info.append(name,subtitle);
 const check=document.createElement("span");check.className="theme-check";check.textContent="✦";check.setAttribute("aria-hidden","true");
 button.append(swatch,info,check);themeChoices.append(button);
}
function render(){
 state=cleaned(state);
 for(const button of document.querySelectorAll("[data-theme]")){
  const on=button.dataset.theme===state.theme;
  button.classList.toggle("is-selected",on);
  button.setAttribute("aria-pressed",String(on));
 }
 for(const key of ["layout","density","headlines","masthead","photos","paper","rules","copySize","accent"])$(key).value=state[key];
 for(const button of document.querySelectorAll("[data-ink]")){
  const active=button.dataset.ink.toLowerCase()===state.accent.toLowerCase();
  button.classList.toggle("is-selected",active);
  button.setAttribute("aria-pressed",String(active));
 }
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
for(const key of ["layout","density","headlines",...Object.keys(additional)]){
 $(key).addEventListener("change",()=>{state[key]=$(key).value;render();feedback("Preview updated. Not published.")});
}
$("accent").addEventListener("input",()=>{state.accent=$("accent").value;render();feedback("Ink color updated. Not published.")});
document.querySelectorAll("[data-ink]").forEach(button=>button.addEventListener("click",()=>{
 state.accent=button.dataset.ink;render();feedback("New ink, same truth. Preview only.");
}));
$("preview-page").addEventListener("change",()=>{render();feedback("Previewing "+$("preview-page").selectedOptions[0].textContent+".")});
$("surprise").addEventListener("click",()=>{
 lastSurprise={...state};
 const keys=Object.keys(catalog.themes);
 const sample=a=>a[Math.floor(Math.random()*a.length)];
 const theme=sample(keys);
 state={...state,theme,layout:sample(Object.keys(options)),density:sample(Object.keys(densities)),
  headlines:sample(Object.keys(faces)),masthead:sample(additional.masthead),
  photos:sample(additional.photos),paper:sample(additional.paper),rules:sample(additional.rules),
  copySize:sample(["small","standard","large"]),
  accent:sample(["#2b4d58","#a95d77","#b8ff2d","#b84c39","#4f8492","#d3b395",catalog.themes[theme].defaultAccent])};
 render();feedback("The printer has opinions. Try another, or restore this edition.");
});
$("reset-design").addEventListener("click",()=>{
 state={theme:catalog.defaultTheme,...catalog.defaultSettings};
 render();feedback("Restored the default proof. Nothing published.");
});
$("open-preview").addEventListener("click",()=>window.open(previewUrl(),"_blank","noopener,noreferrer"));
function drafts(){
 try{const a=JSON.parse(localStorage.getItem(storage)||"[]");return Array.isArray(a)?a:[]}catch(_){return []}
}
function writeDrafts(a){
 try{localStorage.setItem(storage,JSON.stringify(a));return true}catch(_){feedback("Storage unavailable. Export a design pack instead.");return false}
}
function snapshot(){
 const name=($("draft-name").value||"Untitled edition").trim().slice(0,64);
 return {format:"vcs-design-pack",version:2,name,createdAt:new Date().toISOString(),design:{...state},notes:$("art-notes").value.trim().slice(0,600),publication:"Vice City Sinner",stage:"draft"};
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
  use.addEventListener("click",()=>{state=cleaned(entry.design||{});$("draft-name").value=entry.name||"";$("art-notes").value=entry.notes||"";render();feedback("Draft loaded for preview.")});
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
  $("art-notes").value=String(obj.notes||"").slice(0,600);
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
 next.defaultSettings={...state};
 delete next.defaultSettings.theme;
 const file="/* VCS PUBLICATION SETTINGS. Replaces publication-config.js in STAGING on release. */\nwindow.VCS_PUBLICATION = "+JSON.stringify(next,null,2)+";\n";
 download("publication-config.js",file,"text/javascript");
 feedback("Publishing file downloaded. It is NOT live until committed to the staging repository.");
});
render();renderDrafts();
})();
