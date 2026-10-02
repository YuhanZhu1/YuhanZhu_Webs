(() => {
  const links = [...document.querySelectorAll('.photo-link')];
  const more = document.getElementById('load-more');
  const count = document.getElementById('gallery-count');
  let shown = Math.min(24, links.length);
  const updateCount = () => { count.textContent = `Showing ${shown} of ${links.length} photographs`; more.hidden = shown === links.length; };
  links.forEach((link, i) => { link.hidden = i >= shown; });
  updateCount();
  more.addEventListener('click', () => {
    const first = shown; shown = Math.min(shown + 24, links.length);
    links.slice(first, shown).forEach(link => { link.hidden = false; });
    updateCount(); links[first]?.focus({ preventScroll: true });
    links[first]?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  const dialog = document.getElementById('photo-viewer');
  if (!dialog.showModal) return; // Links still open display-sized photos without dialog support.
  const image = document.getElementById('viewer-image');
  const stage = document.getElementById('viewer-stage');
  const status = document.getElementById('viewer-status');
  const previous = document.getElementById('previous-photo');
  const next = document.getElementById('next-photo');
  const original = document.getElementById('original-photo');
  let current = 0, version = 0, opener, touch;
  const prefetched = new Set();
  function prefetch(index) {
    const connection = navigator.connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
    for (const neighbor of [index - 1, index + 1]) {
      if (!links[neighbor] || prefetched.has(neighbor)) continue;
      prefetched.add(neighbor); const img = new Image(); img.decoding = 'async'; img.src = links[neighbor].href;
    }
  }
  async function show(index) {
    if (index < 0 || index >= links.length) return;
    current = index; const token = ++version; const link = links[index];
    previous.disabled = index === 0; next.disabled = index === links.length - 1;
    stage.classList.add('is-loading'); status.textContent = 'Loading photograph…';
    original.href = link.dataset.original;
    const candidate = new Image(); candidate.decoding = 'async'; candidate.src = link.href;
    try {
      await candidate.decode();
      if (token !== version || !dialog.open) return;
      image.src = candidate.src; image.alt = link.querySelector('img').alt;
      document.getElementById('viewer-title').textContent = image.alt;
      document.getElementById('viewer-counter').textContent = `${index + 1} / ${links.length}`;
      status.textContent = ''; prefetch(index);
    } catch {
      if (token === version && dialog.open) status.textContent = 'This image couldn’t load. Try another photograph or open the original.';
    } finally { if (token === version) stage.classList.remove('is-loading'); }
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); opener = link; dialog.showModal(); document.body.style.overflow = 'hidden'; show(index);
  }));
  document.getElementById('close-viewer').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => show(current - 1)); next.addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => { if (event.altKey || event.ctrlKey || event.metaKey) return; if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); } if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); } });
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); });
  stage.addEventListener('touchstart', event => { touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }, { passive: true });
  stage.addEventListener('touchend', event => { if (!touch || !event.changedTouches.length) return; const x = event.changedTouches[0].clientX - touch.x, y = event.changedTouches[0].clientY - touch.y; if (Math.abs(x) > 50 && Math.abs(x) > Math.abs(y)) show(current + (x < 0 ? 1 : -1)); touch = null; }, { passive: true });
  dialog.addEventListener('close', () => { version++; document.body.style.overflow = ''; opener?.focus({ preventScroll: true }); });
})();
