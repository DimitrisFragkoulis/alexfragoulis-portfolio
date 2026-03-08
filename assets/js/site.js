
// Reveal on scroll (unchanged)
(function () {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

function tryLoad(urls, onFirstSuccess) {
  if (!urls || !urls.length) return;
  let i = 0;
  const tryNext = () => {
    if (i >= urls.length) return;
    const u = urls[i++];
    if (!u) return tryNext();
    const img = new Image();
    img.onload = () => onFirstSuccess(u);
    img.onerror = tryNext;
    img.src = u;
  };
  tryNext();
}

function candidateImages(it) {
  const cands = [];
  const ph = it.placeholder || "";
  if (it.image) cands.push(it.image);
  if (ph.endsWith(".svg")) {
    const base = ph.slice(0, -4);
    cands.push(base);
    if (!base.endsWith(".jpg")) cands.push(base + ".jpg");
    cands.push(base + ".jpeg");
    cands.push(base + ".png");
  }
  return Array.from(new Set(cands));
}

(function () {
  document.querySelectorAll(".marquee img").forEach((img) => {
    const real = img.getAttribute("data-src");
    if (!real) return;
    tryLoad([real], (good) => {
      img.src = good;
    });
  });
})();

fetch('data/artworks.json')
  .then(r=>r.json())
  .then(items=>{
    const mount = {
      textile: document.getElementById('grid-textile'),
      arch: document.getElementById('grid-arch'),
      mixed: document.getElementById('grid-mixed'),
      illustration: document.getElementById('grid-illustration'),
      identity: document.getElementById('grid-identity'),
      exhibition: document.getElementById('grid-exhibition'),
    };
    items.forEach(it=>{
      let target = null;
      if (it.series === 'Textile Monotypes') target = mount.textile;
      else if (it.series === 'Architecture Linocuts') target = mount.arch;
      else if (it.series === 'Identity') target = mount.identity;
      else if (it.series === 'Exhibition Views') target = mount.exhibition;
      else if (it.series === 'Illustration') target = mount.illustration;
      else target = mount.mixed;
      if (!target) return;

      const tile = document.createElement('div');
      tile.className = 'tile';
      const img = document.createElement('img');
      img.alt = it.alt || it.title || '';
      const placeholder = it.placeholder || '';
      if (placeholder) img.src = placeholder;
      const candidates = candidateImages(it);
      tryLoad(candidates.filter(Boolean), good => img.src = good);

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `<strong>${it.title || ''}</strong><div>${it.technique || ''}${it.year? ' · '+it.year:''}</div>`;
      tile.appendChild(img); tile.appendChild(meta); target.appendChild(tile);
    });
  })
  .catch(err=>console.warn('artworks.json not loaded:', err));
