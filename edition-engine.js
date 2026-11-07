/* VCS EDITION ENGINE / Shared by every page.
   Client-side preview does not alter the published default or send any data. */
(function(){
"use strict";
const catalog=window.VCS_PUBLICATION;
if(!catalog)return;
const root=document.documentElement;
const query=new URLSearchParams(location.search);
const PREFIX="vcs-edition-settings-v1";
const LOCKED=root.getAttribute("data-vcs-locked-theme");
const qs=query.get("vcs_theme");
const isPreview=query.get("vcs_preview")==="1";
let saved=null;
try{saved=JSON.parse(localStorage.getItem(PREFIX)||"null")}catch(_){saved=null}
const validKey=(value,available,fallback)=>Object.prototype.hasOwnProperty.call(available,value)?value:fallback;
const modes={broadsheet:true,folio:true,poster:true};
const densities={classic:true,compact:true,airy:true};
const fonts={newspaper:true,deco:true,condensed:true};
const isHex=v=>typeof v==="string"&&/^#[0-9a-fA-F]{6}$/.test(v);
function options(){
 const defaults=catalog.defaultSettings||{};
 const theme=validKey(LOCKED||qs||(saved&&saved.theme)||catalog.defaultTheme,catalog.themes,catalog.defaultTheme);
 const layout=validKey(query.get("vcs_layout")||(saved&&saved.layout)||defaults.layout,modes,"broadsheet");
 const density=validKey(query.get("vcs_density")||(saved&&saved.density)||defaults.density,densities,"classic");
 const headlines=validKey(query.get("vcs_headlines")||(saved&&saved.headlines)||defaults.headlines,fonts,"newspaper");
 const tryAccent=query.get("vcs_accent")||(saved&&saved.theme===theme&&saved.accent)||catalog.themes[theme].defaultAccent||defaults.accent;
 const accent=isHex(tryAccent)?tryAccent:"#2b4d58";
 return {theme,layout,density,headlines,accent};
}
const active=options();
root.dataset.vcsTheme=active.theme;
root.dataset.vcsLayout=active.layout;
root.dataset.vcsDensity=active.density;
root.dataset.vcsHeadlines=active.headlines;
root.style.setProperty("--vcs-accent",active.accent);
root.style.setProperty("color-scheme",active.theme==="black-letter"?"dark":"light");
const link=document.createElement("link");
link.rel="stylesheet";
link.href=catalog.themes[active.theme].css+"?v=1";
link.setAttribute("data-vcs-theme-css","");
document.head.appendChild(link);
window.VCS_EDITION={
 config:catalog,
 settings:active,
 storageKey:PREFIX,
 preview:isPreview,
 save(settings){const o={...active,...settings};localStorage.setItem(PREFIX,JSON.stringify(o));return o},
 reset(){localStorage.removeItem(PREFIX)}
};
/* Keep the chosen visual treatment when following links inside the preview iframe. */
if(isPreview){
 document.addEventListener("DOMContentLoaded",()=>{
  for(const a of document.querySelectorAll('a[href]')){
   const href=a.getAttribute('href');
   if(!href||href.startsWith("#")||href.startsWith("mailto:")||href.startsWith("tel:"))continue;
   try{
    const u=new URL(href,location.href);
    if(u.origin!==location.origin)continue;
    u.searchParams.set("vcs_preview","1");
    for(const [param,key] of [["vcs_theme","theme"],["vcs_layout","layout"],["vcs_density","density"],["vcs_headlines","headlines"],["vcs_accent","accent"]])u.searchParams.set(param,active[key]);
    a.href=u.href;
   }catch(_){}
  }
 });
}
})();
