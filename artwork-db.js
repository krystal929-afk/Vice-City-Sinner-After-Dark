/* Local artwork cabinet. No network upload, no credentials. */
(function(){
"use strict";
const NAME="vcs-art-vault-v1",STORE="cabinet";
let ready;
function open(){
 if(!ready)ready=new Promise((resolve,reject)=>{
  const req=indexedDB.open(NAME,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error("Artwork storage unavailable"));
 });
 return ready;
}
async function read(key){
 const db=await open();
 return new Promise((resolve,reject)=>{
  const req=db.transaction(STORE,"readonly").objectStore(STORE).get(key);
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
}
async function write(key,value){
 const db=await open();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,"readwrite");
  tx.objectStore(STORE).put(value,key);
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error("Artwork storage aborted"));
 });
}
window.VCS_ART_DB={read,write};
})();
