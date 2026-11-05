/* Shared data layer. To go live with many visitors, replace load()/save() with fetch() calls to a backend (see README). */
const KEY='krrc_data_v1';
const WA='https://wa.me/254798631925';
const DEFAULTS={
 settings:{accent:'#c8102e',heroTitle:'Aim true.',heroSub:"Nairobi's home of sports shooting since 1952. Beginners welcome, no experience needed. Coaching, safety briefing and all equipment included.",password:'admin1234'},
 pricing:[
  {name:'Rifle session',price:'KSh 4,000',note:'.22 calibre · 20 rounds · every Saturday group rate'},
  {name:'Handgun session',price:'KSh 5,000',note:'.22 calibre · 20 rounds · every Saturday group rate'},
  {name:'Range entry',price:'KSh 2,000',note:'Students KSh 1,500 per session'},
  {name:'Ammunition',price:'KSh 2,500–3,000',note:'Per 50 rounds'}],
 posts:[
  {id:'p1',title:'Bring your friends',body:'Saturdays at the range hit different when the whole squad shows up. Bring your group, reserve a lane on WhatsApp and we handle the coaching, the briefing and the kit.',img:'',layout:'featured',pinned:true,date:'2026-09-25',comments:[]},
  {id:'p2',title:'Gold in Cairo',body:'Our shooters brought home gold from the Cairo rifle and pistol cup. Proud of every one of you.',img:'',layout:'wide',pinned:false,date:'2026-10-12',comments:[]},
  {id:'p3',title:'Airsoft for kids',body:'A safe, supervised way for young ones to learn range discipline.',img:'',layout:'standard',pinned:false,date:'2026-10-05',comments:[]},
  {id:'p4',title:'Directions to the range',body:'Enter through the Nairobi Sailing Club gate on Lang\'ata Road, near Carnivore Junction.',img:'',layout:'text',pinned:false,date:'2026-09-10',comments:[]}],
 gallery:[]
};
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.posts)return d}catch(e){}return JSON.parse(JSON.stringify(DEFAULTS))}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){alert('Could not save: storage full or blocked.')}}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>{try{return new Date(d).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}catch(e){return d}};
const safeUrl=u=>/^(https?:\/\/|images\/|data:image\/)/i.test(u||'')?u:'';

const LK='krrc_liked',NK='krrc_name';
const openPosts=new Set();
const lsGet=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?f:v}catch(e){return f}};
const likedSet=()=>new Set(lsGet(LK,[]));
const saveLiked=s=>{try{localStorage.setItem(LK,JSON.stringify([...s]))}catch(e){}};
const ICON={
 heart:'<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>',
 chat:'<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/></svg>',
 share:'<svg viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>',
 send:'<svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>'
};
const compact=n=>{n=n||0;return n>=1000?(n/1000).toFixed(n>=10000?0:1).replace('.0','')+'K':String(n)};
const hue=n=>{let h=0;for(const ch of String(n))h=(h*31+ch.charCodeAt(0))%360;return h};
const ago=iso=>{const s=(Date.now()-new Date(iso))/1000;if(isNaN(s))return '';if(s<60)return 'just now';const m=s/60;if(m<60)return Math.floor(m)+'m';const h=m/60;if(h<24)return Math.floor(h)+'h';const d=h/24;if(d<7)return Math.floor(d)+'d';return fmt(iso)};
const postUrl=p=>location.href.split('#')[0]+'#'+p.id;

function commentHtml(c,p,liked,isReply){
 const nm=c.name||'?';
 return `<div class="c${isReply?' reply':''}"><span class="av" style="background:hsl(${hue(nm)},55%,42%)">${esc(nm.charAt(0).toUpperCase())}</span>
 <div class="cb"><b>${esc(nm)}</b><p>${esc(c.text)}</p><div class="cmeta"><span>${esc(ago(c.date))}</span><button type="button" class="lnk" data-act="reply" data-cid="${esc(isReply?c.parent:c.id)}" data-name="${esc(nm)}">Reply</button></div></div>
 <button type="button" class="clike${liked.has(c.id)?' on':''}" data-act="clike" data-pid="${esc(p.id)}" data-cid="${esc(c.id)}" aria-label="Like comment">${ICON.heart}<span>${compact(c.likes)}</span></button></div>`;
}
function commentsHtml(p,liked){
 const all=p.comments||[];
 if(!all.length)return '<p class="empty-c">No comments yet. Be the first.</p>';
 return all.filter(c=>!c.parent).map(c=>commentHtml(c,p,liked,false)+all.filter(r=>r.parent===c.id).map(r=>commentHtml(r,p,liked,true)).join('')).join('');
}

function renderSite(){
 const d=load(),s=d.settings,liked=likedSet(),myName=lsGet(NK,'');
 document.documentElement.style.setProperty('--accent',s.accent);
 q('#heroTitle').textContent=s.heroTitle;q('#heroSub').textContent=s.heroSub;
 q('#prices').innerHTML=d.pricing.map(p=>`<div class="price"><h3>${esc(p.name)}</h3><div class="amt">${esc(p.price)}</div><small>${esc(p.note)}</small></div>`).join('');
 const posts=[...d.posts].sort((a,b)=>(b.pinned-a.pinned)||(new Date(b.date)-new Date(a.date)));
 q('#posts').innerHTML=posts.map(p=>{
  const img=safeUrl(p.img),open=openPosts.has(p.id),url=postUrl(p),msg=encodeURIComponent(p.title+' - Kenya Regiment Rifle Club '+url);
  return `<article class="post l-${esc(p.layout)}" id="${esc(p.id)}">
  <div class="pimg ${img?'':'empty'}" ${img?`style="background-image:url('${esc(img)}')"`:''} role="img" aria-label="${esc(p.title)}"></div>
  <div style="flex:1;display:flex;flex-direction:column"><div class="pbody">
   <div class="meta">${p.pinned?'<span class="pin">Pinned</span>':''}${fmt(p.date)}</div>
   <h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></div>
   <div class="actions">
    <button type="button" class="act like${liked.has(p.id)?' on':''}" data-act="like" data-pid="${esc(p.id)}" aria-label="Like">${ICON.heart}<span>${compact(p.likes)}</span></button>
    <button type="button" class="act${open?' on':''}" data-act="toggle" data-pid="${esc(p.id)}" aria-label="Comments">${ICON.chat}<span class="ccount">${compact((p.comments||[]).length)}</span></button>
    <span class="shwrap"><button type="button" class="act" data-act="share" data-pid="${esc(p.id)}" aria-label="Share">${ICON.share}<span class="scount">${compact(p.shares)}</span></button>
     <div class="smenu"><a data-act="shared" data-pid="${esc(p.id)}" href="https://wa.me/?text=${msg}" target="_blank" rel="noopener">Share on WhatsApp</a>
      <a data-act="shared" data-pid="${esc(p.id)}" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">Share on Facebook</a>
      <a data-act="shared" data-pid="${esc(p.id)}" href="https://twitter.com/intent/tweet?text=${msg}" target="_blank" rel="noopener">Share on X</a>
      <button type="button" data-act="copy" data-pid="${esc(p.id)}">Copy link</button></div></span>
   </div>
   <div class="cpanel${open?'':' hide'}"><div class="clist">${commentsHtml(p,liked)}</div>
    <form class="cform" data-id="${esc(p.id)}"><div class="replying hide"><span>Replying to <b class="rname"></b></span><button type="button" class="lnk" data-act="cancelreply">Cancel</button></div>
     <input name="n" placeholder="Your name" required maxlength="40" value="${esc(myName)}" autocomplete="name">
     <div class="comment-field"><textarea name="t" placeholder="Write a comment" required maxlength="300" rows="1" autocomplete="off"></textarea><button type="submit" class="mini-send" aria-label="Post comment">${ICON.send}</button></div>
     <button type="submit" class="post-comment">Post comment</button></form></div>
  </div></article>`}).join('');
 q('#gallery').innerHTML=(d.gallery||[]).filter(safeUrl).map(u=>`<div style="background-image:url('${esc(u)}')"></div>`).join('')||'<p>Photos coming soon.</p>';
 bindPosts();
}

function toast(m){let t=q('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=m;t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',2000)}
function closeMenus(except){qa('.smenu.open').forEach(m=>{if(m!==except)m.classList.remove('open')})}
function bumpShare(pid){const d=load(),p=d.posts.find(x=>x.id===pid);if(!p)return;p.shares=(p.shares||0)+1;save(d);const el=document.querySelector('#'+CSS.escape(pid)+' .scount');if(el)el.textContent=compact(p.shares)}
function bindPosts(){
 const root=q('#posts');if(root.dataset.bound)return;root.dataset.bound='1';
 document.addEventListener('click',e=>{if(!e.target.closest('.shwrap'))closeMenus()});
 root.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const act=b.dataset.act,art=b.closest('article'),pid=b.dataset.pid||(art&&art.id);
  if(act==='like'||act==='clike'){
   const d=load(),p=d.posts.find(x=>x.id===pid);if(!p)return;
   const target=act==='like'?p:(p.comments||[]).find(c=>c.id===b.dataset.cid);if(!target)return;
   const key=act==='like'?pid:b.dataset.cid,L=likedSet();
   if(L.has(key)){L.delete(key);target.likes=Math.max(0,(target.likes||0)-1)}else{L.add(key);target.likes=(target.likes||0)+1}
   save(d);saveLiked(L);b.classList.toggle('on',L.has(key));b.querySelector('span').textContent=compact(target.likes);
  }else if(act==='toggle'){
   const panel=art.querySelector('.cpanel');panel.classList.toggle('hide');const o=!panel.classList.contains('hide');
   if(o)openPosts.add(pid);else openPosts.delete(pid);
   b.classList.toggle('on',o);
   if(o){const cl=panel.querySelector('.clist');cl.scrollTop=cl.scrollHeight}
  }else if(act==='share'){
   const p=load().posts.find(x=>x.id===pid);
   if(navigator.share){navigator.share({title:p.title,text:p.title+' - Kenya Regiment Rifle Club',url:postUrl(p)}).then(()=>bumpShare(pid)).catch(()=>{})}
   else{const m=b.nextElementSibling;closeMenus(m);m.classList.toggle('open')}
  }else if(act==='shared'){bumpShare(pid);closeMenus()}
  else if(act==='copy'){
   const p=load().posts.find(x=>x.id===pid),url=postUrl(p);
   const done=()=>{toast('Link copied');bumpShare(pid);closeMenus()};
   if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(done,()=>{prompt('Copy this link:',url)});
   else{const t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(x){prompt('Copy this link:',url)}t.remove()}
  }else if(act==='reply'){
   const f=art.querySelector('.cform');f.dataset.parent=b.dataset.cid;
   f.querySelector('.rname').textContent=b.dataset.name;f.querySelector('.replying').classList.remove('hide');f.t.focus();
  }else if(act==='cancelreply'){
   const f=b.closest('.cform');delete f.dataset.parent;f.querySelector('.replying').classList.add('hide');
  }
 });
 root.addEventListener('submit',e=>{
  const f=e.target.closest('.cform');if(!f)return;e.preventDefault();
  const d=load(),pid=f.dataset.id,p=d.posts.find(x=>x.id===pid);if(!p)return;
  const name=f.n.value.trim(),text=f.t.value.trim();if(!name||!text)return;
  const c={id:'c'+Date.now(),name,text,date:new Date().toISOString(),likes:0};
  if(f.dataset.parent)c.parent=f.dataset.parent;
  (p.comments=p.comments||[]).push(c);save(d);
  try{localStorage.setItem(NK,JSON.stringify(name))}catch(x){}
  openPosts.add(pid);renderSite();
  const cl=document.querySelector('#'+CSS.escape(pid)+' .clist');if(cl)cl.scrollTop=cl.scrollHeight;
 });
}
function q(s){return document.querySelector(s)}function qa(s){return document.querySelectorAll(s)}
function targetHoles(){const t=q('.target');if(!t)return;[[52,48],[46,55],[58,40],[50,62],[40,45]].forEach((p,i)=>{const h=document.createElement('i');h.className='hole';h.style.left=p[0]+'%';h.style.top=p[1]+'%';h.style.animationDelay=(0.4+i*.25)+'s';t.appendChild(h)})}
if(q('#posts')){renderSite();targetHoles();q('#year').textContent=new Date().getFullYear()}