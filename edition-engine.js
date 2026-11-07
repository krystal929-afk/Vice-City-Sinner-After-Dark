/* VCS Edition Engine v2. Theme packs and art-direction options are strictly visual. */
(function(){
"use strict";
const catalog=window.VCS_PUBLICATION;
if(!catalog)return;
const root=document.documentElement;
const query=new URLSearchParams(location.search);
const STORAGE="vcs-edition-settings-v1";
const LEGACY_LOCK=root.getAttribute("data-vcs-locked-theme");
const PREVIEW=query.get("vcs_preview")==="1";
const options={
 layout:["broadsheet","folio","poster","editorial","gallery"],
 density:["classic","compact","airy"],
 headlines:["newspaper","deco","condensed","slab","italic"],
 masthead:["heritage","deco","whisper","brutalist","stacked"],
 photos:["archival","truecolor","washed","contrast","tint"],
 paper:["newsprint","clean","weathered","folded"],
 rules:["classic","hairline","heavy","dashed"],
 copySize:["small","standard","large","oversize"]
};
const valid=(k,v,fallback)=>options[k]?.includes(v)?v:fallback;
const color=v=>typeof v==="string"&&/^#[0-9a-fA-F]{6}$/.test(v);
let stored;
try{stored=JSON.parse(localStorage.getItem(STORAGE)||"null")}catch(_){stored=null}
const defs=catalog.defaultSettings||{};
const knownThemes=catalog.themes||{};
const hasTheme=key=>typeof key==="string"&&Object.prototype.hasOwnProperty.call(knownThemes,key);
const themeCandidates=[LEGACY_LOCK,query.get("vcs_theme"),stored?.theme,catalog.defaultTheme];
const theme=themeCandidates.find(hasTheme)||catalog.defaultTheme;
const active={theme};
for(const key of Object.keys(options)){
 active[key]=valid(key,query.get("vcs_"+key)||stored?.[key]||defs[key],(defs[key]&&options[key].includes(defs[key]))?defs[key]:options[key][0]);
}
const desiredAccent=query.get("vcs_accent")||(stored&&stored.theme===theme&&stored.accent)||knownThemes[theme].defaultAccent||defs.accent;
active.accent=color(desiredAccent)?desiredAccent:"#2b4d58";
for(const key of Object.keys(options))root.dataset["vcs"+key.charAt(0).toUpperCase()+key.slice(1)]=active[key];
root.dataset.vcsTheme=theme;
root.style.setProperty("--vcs-accent",active.accent);
root.style.setProperty("color-scheme",["black-letter","velvet-vice","acid-riviera"].includes(theme)?"dark":"light");
const link=document.createElement("link");
link.rel="stylesheet";
link.href=knownThemes[theme].css+"?v=2";
link.setAttribute("data-vcs-theme-css","");
document.head.appendChild(link);
window.VCS_EDITION={
 config:catalog,
 settings:active,
 storageKey:STORAGE,
 preview:PREVIEW,
 save(settings){const merged={...active,...settings};localStorage.setItem(STORAGE,JSON.stringify(merged));return merged},
 reset(){localStorage.removeItem(STORAGE)}
};
if(PREVIEW){
 document.addEventListener("DOMContentLoaded",()=>{
  for(const a of document.querySelectorAll("a[href]")){
   const href=a.getAttribute("href");
   if(!href||href.startsWith("#")||href.startsWith("mailto:")||href.startsWith("tel:"))continue;
   try{
    const u=new URL(href,location.href);
    if(u.origin!==location.origin)continue;
    u.searchParams.set("vcs_preview","1");
    u.searchParams.set("vcs_theme",active.theme);
    for(const key of Object.keys(options))u.searchParams.set("vcs_"+key,active[key]);
    u.searchParams.set("vcs_accent",active.accent);
    a.href=u.href;
   }catch(_){}
  }
 });
}
})();
