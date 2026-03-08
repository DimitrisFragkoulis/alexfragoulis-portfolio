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
 * Marquee thumbnails
 * - Keep the current placeholders visible.
 * - If a data-src is present and loads successfully, swap it in.
 * - If it fails (404), silently keep the placeholder.
 */
(function () {
  document.querySelectorAll(".marquee img").forEach((img) => {
    const real = img.getAttribute("data-src");
    if (!real) return;

    const probe = new Image();
    probe.onload = () => {
      img.src = real; // swap only if the real file exists
    };
    // If it 404s, we do nothing and leave the placeholder showing
    probe.src = real;
  });
})();

/**
 * Gallery population from data/artworks.json
 * Strategy:
 *  - Always show a working image immediately (placeholder if needed).
 *  - Try to load the real JPG/PNG. If it loads, swap to it.
 *  - If it fails, stay on the placeholder (no broken tiles).
 */
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
      // pick container by series (fallback to 'mixed')
      let target = null;
      if (it.series === "Textile Monotypes") target = mount.textile;
      else if (it.series === "Architecture Linocuts") target = mount.arch;
      else if (it.series === "Identity") target = mount.identity;
      else if (it.series === "Exhibition Views") target = mount.exhibition;
      else if (it.series === "Illustration") target = mount.illustration;
      else target = mount.mixed;

      if (!target) return;

      // Create tile
      const tile = document.createElement("div");
      tile.className = "tile";

      // Image element — show something immediately
      const img = document.createElement("img");
      // Start with placeholder (always exists in v5)
      const placeholder = it.placeholder || it.image || "";
      const real = it.image || "";
      img.alt = it.alt || it.title || "";

      // Use the placeholder as the first visible image
      if (placeholder) img.src = placeholder;

      // Try to load real image (only if provided and different)
      if (real && real !== placeholder) {
        const probe = new Image();
        probe.onload = () => {
          img.src = real; // swap to real image only if it loads
        };
        // If it fails, keep placeholder (no errors shown)
        probe.src = real;
      }

      // Meta
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `<strong>${it.title || ""}</strong><div>${
        it.technique || ""
      }${it.year ? " · " + it.year : ""}</div>`;

      tile.appendChild(img);
      tile.appendChild(meta);
      target.appendChild(tile);
    });
  })
  .catch((err) => {
    // If the data file can't be loaded, fail silently (keeps the rest of the page working)
    console.warn("artworks.json not loaded:", err);
  });
