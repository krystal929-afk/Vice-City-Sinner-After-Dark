document.addEventListener('DOMContentLoaded',()=>{
 const btn=document.querySelector('.fine-print-trigger');
 const fine=document.getElementById('fine-print');
 if(btn&&fine)btn.addEventListener('click',()=>{
  const show=fine.hasAttribute('hidden');
  if(show)fine.removeAttribute('hidden');else fine.setAttribute('hidden','');
  btn.setAttribute('aria-expanded',String(show));
  btn.querySelector('span').textContent=show?'−':'+';
 });
 const root=document.documentElement;
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const crypt=document.querySelector('.tiny-crest');
 if(crypt){
  crypt.addEventListener('mouseenter',()=>crypt.classList.add('crest-noticed'));
 }
});
