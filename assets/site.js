
// Reveal on scroll
(function(){
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:0.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();
// Swap marquee placeholders to real image if present
(function(){
  document.querySelectorAll('.marquee img').forEach(img=>{
    const src=img.getAttribute('data-src');
    if(!src) return; const t=new Image(); t.onload=()=>{img.src=src}; t.src=src;
  });
})();
// Populate grids from data/artworks.json
fetch('data/artworks.json').then(r=>r.json()).then(items=>{
  const mount={textile:document.getElementById('grid-textile'),arch:document.getElementById('grid-arch'),mixed:document.getElementById('grid-mixed'),illustration:document.getElementById('grid-illustration'),identity:document.getElementById('grid-identity'),exhibition:document.getElementById('grid-exhibition')};
  items.forEach(it=>{
    let target=null; if(it.series==='Textile Monotypes') target=mount.textile; else if(it.series==='Architecture Linocuts') target=mount.arch; else if(it.series==='Identity') target=mount.identity; else if(it.series==='Exhibition Views') target=mount.exhibition; else target=mount.mixed;
    if(!target) return; const tile=document.createElement('div'); tile.className='tile'; const img=document.createElement('img'); img.alt=it.alt||it.title; img.src=it.placeholder||it.image; const real=new Image(); real.onload=()=>{img.src=it.image}; real.src=it.image; const meta=document.createElement('div'); meta.className='meta'; meta.innerHTML=`<strong>${it.title}</strong><div>${it.technique}${it.year? ' · '+it.year:''}</div>`; tile.appendChild(img); tile.appendChild(meta); target.appendChild(tile);
  });
});
