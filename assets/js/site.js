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

/**
 * Try-load helper: attempts a list of URLs in order; calls onFirstSuccess with the first that loads.
 * If none load, does nothing (keeps placeholder).
 */
function tryLoad(urls, onFirstSuccess) {
  if (!urls || !urls.length) return;
  let i = 0;
  const tryNext = () => {
    if (i >= urls.length) return;
    const u = urls[i++];
    if (!u) return tryNext();
    const img = new Image();
    img.onload = () => onFirstSuccess(u);
    img.onerror = tryNext; // quietly try next
    img.src = u;
  };
  tryNext();
}

/**
 * Turn a placeholder path like ".../17845536033442720.jpg.svg"
 * into candidate real image names we’ll try in order:
 *   1) (explicit it.image if provided)
 *   2) base-without-.svg + ".jpg"
 *   3) base-without-.svg + ".jpeg"
 *   4) base-without-.svg + ".png"
 */
function candidateImages(it) {
  const cands = [];
  const ph = it.placeholder || "";
  if (it.image) cands.push(it.image);
  if (ph.endsWith(".svg")) {
    const base = ph.slice(0, -4); // remove ".svg"
    cands.push(base);             // if placeholder already ends with .jpg.svg → first try ".jpg"
    if (!base.endsWith(".jpg")) cands.push(base + ".jpg");
    cands.push(base + ".jpeg");
    cands.push(base + ".png");
  }
  return Array.from(new Set(cands)); // unique
}

/** Marquee: keep placeholder; try to swap to real image if it exists */
(function () {
  document.querySelectorAll(".marquee img").forEach((img) => {
    const real = img.getAttribute("data-src");
    if (!real) return;
    tryLoad([real], (good) => {
      img.src = good;
    });
  });
})();

/** Build the grids from data/artworks.json with smart fallback */
fetch("data/artworks.json")
  .then((r) => r.json())
  .then((items) => {
    const mount = {
      textile: document.getElementById("grid-textile"),
      arch: document.getElementById("grid-arch"),
      mixed: document.getElementById("grid-mixed"),
      illustration: document.getElementById("grid-illustration"),
      identity: document.getElementById("grid-identity"),
      exhibition: document.getElementById("grid-exhibition"),
    };

    items.forEach((it) => {
      let target = null;
      if (it.series === "Textile Monotypes") target = mount.textile;
      else if (it.series === "Architecture Linocuts") target = mount.arch;
      else if (it.series === "Identity") target = mount.identity;
      else if (it.series === "Exhibition Views") target = mount.exhibition;
      else if (it.series === "Illustration") target = mount.illustration;
      else target = mount.mixed;

      if (!target) return;

      // Tile shell
      const tile = document.createElement("div");
      tile.className = "tile";

      // Start with placeholder (always exists in your repo)
      const img = document.createElement("img");
      img.alt = it.alt || it.title || "";
      const placeholder = it.placeholder || ""; // e.g., assets/img/1784....jpg.svg
      if (placeholder) img.src = placeholder;

      // Try to swap to a real file if any candidate loads
      const candidates = candidateImages(it);
      tryLoad(
        candidates.filter(Boolean),
        (good) => (img.src = good)
      );

      // Meta
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `<strong>${it.title || ""}</strong><div>${it.technique || ""}${it.year ? " · " + it.year : ""}</div>`;

      tile.appendChild(img);
      tile.appendChild(meta);
      target.appendChild(tile);
    });
  })
  .catch((err) => {
    console.warn("artworks.json not loaded:", err);
  });
