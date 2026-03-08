
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
})();

function tryLoad(urls, onFirstSuccess) {
  if (!urls || !urls.length) return;
  let i = 0; const tryNext = () => { if (i >= urls.length) return; const u = urls[i++]; if (!u) return tryNext(); const img = new Image(); img.onload = () => onFirstSuccess(u); img.onerror = tryNext; img.src = u; }; tryNext();
}
function candidateImages(it) {
  const c=[]; const ph=it.placeholder||''; if (it.image) c.push(it.image); if (ph.endsWith('.svg')) { const b=ph.slice(0,-4); c.push(b); if(!b.endsWith('.jpg')) c.push(b+'.jpg'); c.push(b+'.jpeg'); c.push(b+'.png'); } return Array.from(new Set(c));
}
fetch('data/artworks.json').then(r=>r.json()).then(items=>{
  const m={textile:document.getElementById('grid-textile'),arch:document.getElementById('grid-arch'),mixed:document.getElementById('grid-mixed'),illustration:document.getElementById('grid-illustration'),identity:document.getElementById('grid-identity'),exhibition:document.getElementById('grid-exhibition')};
  items.forEach(it=>{ let t=null; if(it.series==='Textile Monotypes') t=m.textile; else if(it.series==='Architecture Linocuts') t=m.arch; else if(it.series==='Identity') t=m.identity; else if(it.series==='Exhibition Views') t=m.exhibition; else if(it.series==='Illustration') t=m.illustration; else t=m.mixed; if(!t) return; const tile=document.createElement('div'); tile.className='tile'; const img=document.createElement('img'); img.alt=it.alt||it.title||''; const ph=it.placeholder||''; if(ph) img.src=ph; const cands=candidateImages(it); tryLoad(cands.filter(Boolean), good=> img.src=good); const meta=document.createElement('div'); meta.className='meta'; meta.innerHTML = `<strong>${it.title||''}</strong><div>${it.technique||''}${it.year?' · '+it.year:''}</div>`; tile.appendChild(img); tile.appendChild(meta); t.appendChild(tile); });
}).catch(err=>console.warn('artworks.json not loaded:', err));
