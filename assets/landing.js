// The landing page's one interaction: "דרבק לי קוקטייל" swaps the cocktail under the light and
// shows its spec. Tapping a cocktail on the shelf puts it under the light too.
(function () {
  const cocktails = window.BARMENTI_COCKTAILS || [];
  if (!cocktails.length) return;

  const units = { ml: 'מ״ל', dash: 'דאש', barspoon: 'כף בר', top: 'להשלים', piece: 'יח׳', leaf: 'עלים' };
  const spirits = {
    all: () => true,
    gin: (c) => c.tags.includes('gin'),
    rum: (c) => c.tags.includes('rum'),
    whiskey: (c) => c.tags.includes('whiskey'),
    agave: (c) => c.tags.includes('tequila') || c.tags.includes('mezcal'),
    vodka: (c) => c.tags.includes('vodka'),
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const photo = (c) => `assets/cocktails/${c.id}-v1.webp`;
  const byId = Object.fromEntries(cocktails.map((c) => [c.id, c]));

  const glass = document.getElementById('glass');
  const spec = document.getElementById('spec');
  const rollButton = document.getElementById('roll');
  let current = byId[glass.dataset.id] || cocktails[0];
  let spirit = 'all';
  let rolling = false;

  function amount(value, unit) {
    if (value == null) return units[unit];
    const n = Number.isInteger(value) ? value : Math.round(value * 10) / 10;
    return `${n} ${units[unit]}`;
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function showSpec(c) {
    const head = el('div', 'spec-head');
    head.append(el('h3', null, c.he), el('span', 'en', c.en));
    const list = el('ul', 'ings');
    c.ings.forEach(([value, unit, name]) => {
      const li = el('li');
      li.append(el('span', 'jigger', amount(value, unit)), el('span', null, name));
      list.append(li);
    });
    const serve = el('p', 'serve', c.garnish ? `${c.glass}, ${c.garnish}` : c.glass);
    spec.replaceChildren(head, list, serve);
  }

  function place(c) {
    current = c;
    glass.src = photo(c);
    glass.alt = `${c.he} על הבר`;
    showSpec(c);
  }

  // Warm the photos once, so the shuffle doesn't flicker.
  let warmed = false;
  function warm() {
    if (warmed) return;
    warmed = true;
    cocktails.forEach((c) => {
      const img = new Image();
      img.src = photo(c);
    });
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Bring the whole photo onto the screen (a little below the top), if any of it is cut off.
  const light = document.querySelector('.light');
  function showGlass() {
    const box = light.getBoundingClientRect();
    if (box.top >= 0 && box.bottom <= window.innerHeight) return;
    window.scrollBy({ top: box.top - 12, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function roll() {
    if (rolling) return;
    // Once pressed, it has made its point: no more nudging.
    rollButton.classList.add('used');
    showGlass();
    const pool = cocktails.filter(spirits[spirit]).filter((c) => c.id !== current.id);
    if (!pool.length) return;
    const pickedOne = pool[Math.floor(Math.random() * pool.length)];
    warm();
    if (reduceMotion) {
      place(pickedOne);
      return;
    }
    rolling = true;
    rollButton.classList.add('rolling');
    spec.classList.add('hidden');
    glass.classList.add('shaking');
    // A few quick glances along the shelf, slowing down, then the pick.
    const glances = shuffle(cocktails.filter((c) => c.id !== pickedOne.id)).slice(0, 7);
    let delay = 0;
    glances.forEach((c, i) => {
      delay += 55 + i * 22;
      setTimeout(() => {
        glass.src = photo(c);
      }, delay);
    });
    setTimeout(() => {
      glass.classList.remove('shaking');
      place(pickedOne);
      spec.classList.remove('hidden');
      rollButton.classList.remove('rolling');
      rolling = false;
    }, delay + 220);
  }

  rollButton.addEventListener('click', roll);

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      spirit = chip.dataset.spirit;
      document
        .querySelectorAll('.chip')
        .forEach((other) => other.setAttribute('aria-pressed', String(other === chip)));
    });
  });

  // The shelf: every illustrated cocktail; tapping one sets it under the light.
  const shelf = document.getElementById('shelf');
  cocktails.forEach((c) => {
    const tile = el('button', 'tile');
    tile.type = 'button';
    tile.setAttribute('aria-label', `${c.he}: להציג את המתכון`);
    const img = el('img');
    img.src = photo(c);
    img.alt = '';
    img.loading = 'lazy';
    img.width = 168;
    img.height = 210;
    tile.append(img, el('span', null, c.he));
    tile.addEventListener('click', () => {
      place(c);
      document.getElementById('stage').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
    shelf.append(tile);
  });

  // Phones get their own store first.
  const ua = navigator.userAgent || '';
  const android = /android/i.test(ua);
  const iphone = /iphone|ipad|ipod/i.test(ua);
  // The phone's download bar shows its own store's badge; elsewhere it jumps to both badges.
  const own = android ? 'play' : iphone ? 'apple' : null;
  if (own) {
    document.getElementById('dock-cta').hidden = true;
    document.querySelector(`.dock-badge[data-store="${own}"]`).hidden = false;
  }

  // It steps aside at the end of the page, where the full store buttons are.
  const dock = document.getElementById('dock');
  const download = document.getElementById('download');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => dock.classList.toggle('away', entry.isIntersecting), {
      threshold: 0.2,
    }).observe(download);
  }

  // Elsewhere (iPhone, desktop) the App Store stays first, as written.
  if (android) {
    document.querySelectorAll('.stores').forEach((group) => {
      const play = group.querySelector('[data-store="play"]');
      if (play) group.prepend(play);
    });
  }

  place(current);
})();
