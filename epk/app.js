const C=window.EPK,A=C.artist,$=s=>document.querySelector(s),el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.innerHTML=h;return e};
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
document.querySelectorAll('[data-bind]').forEach(n=>n.textContent=A[n.dataset.bind]);
$('#yr').textContent=new Date().getFullYear();
// bio
$('#bio-short').textContent=C.bio.short;
$('#bio-long').innerHTML=C.bio.long.map(p=>`<p>${esc(p)}</p>`).join('');
$('#highlights').innerHTML=C.highlights.map(h=>`<li>${esc(h)}</li>`).join('');
$('#quotes').innerHTML=C.quotes.map(q=>`<blockquote>“${esc(q.text)}”<cite>${esc(q.by)}</cite></blockquote>`).join('');
document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{
  const t=b.dataset.copy==='short'?C.bio.short:C.bio.long.join('\n\n');
  try{await navigator.clipboard.writeText(t);$('#copied').textContent='Copied ✓'}catch{const ta=el('textarea');ta.value=t;document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();$('#copied').textContent='Copied ✓'}
  setTimeout(()=>$('#copied').textContent='',2200)});
// style
$('#tags').innerHTML=C.style.tags.map(t=>`<span>${esc(t)}</span>`).join('');
$('#sounds').textContent=C.style.soundsLike.join(' · ');
$('#meters').innerHTML=C.style.moods.map(m=>`<div class="meter"><span>${esc(m.label)}</span><div class="bar"><i data-w="${m.value}"></i></div><span>${m.value}</span></div>`).join('');
$('#players').innerHTML=C.style.embeds.length?C.style.embeds.map(e=>`<iframe class="player" src="${esc(e.src)}" title="${esc(e.title)}" loading="lazy" allowfullscreen allow="autoplay; encrypted-media"></iframe>`).join(''):
 `<div class="soon"><p class="kicker">Now spinning</p><h3>Player coming soon</h3><p>Full tracks and live sets will be streaming here. In the meantime, check the releases below.</p><a class="btn btn-sun" href="#discography" style="justify-self:start">See releases</a></div>`;
$('#listen').href=A.listenUrl;
// discography
$('#releases').innerHTML=C.discography.map(r=>`<li class="rel rv"><a href="${esc(r.url)}"><div class="art"><img src="${esc(r.cover)}" alt="Cover art for ${esc(r.title)}" loading="lazy"><b>Listen ▶</b></div><h3>${esc(r.title)}</h3><p>${esc(r.type)} · ${r.year}</p></a></li>`).join('');
// rider
const R=C.rider;
$('#lineup').innerHTML=R.lineup.map(l=>`<li><b>${esc(l.who)}</b>, ${esc(l.role)}</li>`).join('');
$('#schedule').innerHTML=`<dt>Load-in</dt><dd>${esc(R.schedule.loadIn)}</dd><dt>Soundcheck</dt><dd>${esc(R.schedule.soundcheck)}</dd><dt>Set length</dt><dd>${esc(R.schedule.set)}</dd>`;
$('#monitoring').innerHTML=`<b>Monitors:</b> ${esc(R.monitoring)}`;$('#power').innerHTML=`<b>Power:</b> ${esc(R.power)}`;
$('#inputs').innerHTML=R.inputs.map(i=>`<tr><td>${i.ch}</td><td>${esc(i.src)}</td><td>${esc(i.mic)}</td><td>${esc(i.notes)}</td></tr>`).join('');
$('#bring').innerHTML=R.bring.map(x=>`<li>${esc(x)}</li>`).join('');$('#provide').innerHTML=R.provide.map(x=>`<li>${esc(x)}</li>`).join('');
$('#prod').innerHTML=`Production contact: ${esc(R.production.name)} · <a href="mailto:${esc(R.production.email)}">${esc(R.production.email)}</a> · ${esc(R.production.phone)}`;
// stage plot svg
const col={mon:'#ff7a45',pwr:'#ffc857',mic:'#1aa6b7',dj:'#0b2a3a'};
let sv=`<rect x="20" y="20" width="560" height="270" rx="12" fill="#f6ecda" stroke="#0b2a3a" stroke-width="2"/><text x="30" y="40" font-size="11" fill="#0b2a3a" opacity=".6">BACK OF STAGE</text>`;
sv+=R.stagePlot.map(p=>{const k=p.kind||'dj',x=p.x-p.w/2,y=p.y-p.h/2,t=k==='dj'?'#f6ecda':'#0b2a3a';
 return `<g><rect x="${x}" y="${y}" width="${p.w}" height="${p.h}" rx="${k==='mic'?p.w/2:8}" fill="${col[k]}"/><text x="${p.x}" y="${p.y+4}" text-anchor="middle" font-size="${p.w<80?9:12}" font-weight="700" fill="${t}">${k==='dj'?'DJ BOOTH':k==='mic'?'MIC':k==='mon'?'MON':'PWR'}</text><text x="${p.x}" y="${p.y+p.h/2+14}" text-anchor="middle" font-size="10" fill="#0b2a3a">${p.label}</text></g>`}).join('');
sv+=`<text x="300" y="312" text-anchor="middle" font-size="12" font-weight="700" fill="#0b2a3a">▼ AUDIENCE ▼</text><path d="M20 292H580" stroke="#0b2a3a" stroke-width="3" stroke-dasharray="6 6"/>`;
$('#plot').innerHTML=sv;
// gallery + lightbox
$('#gallery').innerHTML=C.photos.map((p,i)=>`<button class="rv" data-i="${i}" aria-label="Open photo: ${esc(p.alt)}"><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy"></button>`).join('');
const lb=$('#lb');let last;
const open=i=>{const p=C.photos[i];$('#lbimg').src=p.hires;$('#lbimg').alt=p.alt;$('#lbdl').href=p.hires;$('#lbdl').setAttribute('download','saransh-press-'+(i+1));lb.hidden=false;last=document.activeElement;$('#lbx').focus()};
const close=()=>{lb.hidden=true;last&&last.focus()};
document.querySelectorAll('.gallery button').forEach(b=>b.onclick=()=>open(+b.dataset.i));
$('#lbx').onclick=close;lb.onclick=e=>{if(e.target===lb)close()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lb.hidden)close()});
// contact
$('#mail').href='mailto:'+A.email;$('#mail').textContent=A.email;
$('#tel').href='tel:'+A.phoneHref;$('#tel').textContent=A.phone;
$('#booklink').href=A.bookingUrl;$('#booklink').textContent=A.bookingUrl.replace('https://','');
$('#socials').innerHTML=A.socials.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('');
$('#form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);
 const body=`Name: ${f.get('name')}\nEmail: ${f.get('email')}\nEvent: ${f.get('event')}\n\n${f.get('msg')}`;
 location.href=`mailto:${A.email}?subject=${encodeURIComponent('Booking enquiry: '+f.get('name'))}&body=${encodeURIComponent(body)}`};
// print downloads
const doPrint=cls=>{document.body.classList.add(cls);window.print()};
window.addEventListener('afterprint',()=>document.body.classList.remove('print-rider','print-kit'));
$('#dlrider').onclick=()=>doPrint('print-rider');$('#dlkit').onclick=()=>doPrint('print-kit');
// reveal + meters + active nav
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:0,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rv,.sec .wrap > *').forEach(n=>{n.classList.add('rv');io.observe(n)});
const mo=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.bar i').forEach(i=>i.style.width=i.dataset.w+'%')}),{threshold:.3});mo.observe($('#meters'));
const links=[...document.querySelectorAll('#navlinks a')];
const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('main section[id]').forEach(s=>so.observe(s));
