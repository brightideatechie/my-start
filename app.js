/* ============================================================
   Startpage Forge — application logic
   - In-memory config (no localStorage: blocked in sandboxed iframes)
   - Live scoped preview + standalone HTML export
   - Perchance generator code export
   ============================================================ */
'use strict';

import { LAYOUTS, getLayout } from './src/layouts.js';

/* ---------------- Constants ---------------- */

const ENGINES = {
  google:     { name: 'Google',     url: 'https://www.google.com/search?q=' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  bing:       { name: 'Bing',      url: 'https://www.bing.com/search?q=' },
  startpage:  { name: 'Startpage', url: 'https://www.startpage.com/sp/search?query=' },
  ecosia:     { name: 'Ecosia',    url: 'https://www.ecosia.org/search?q=' },
  wikipedia:  { name: 'Wikipedia', url: 'https://en.wikipedia.org/w/index.php?search=' },
};

const THEMES = {
  midnight: { label: 'Midnight', bg: '#0b0e14', surface: '#131a26', text: '#e8ecf4', muted: '#8b94a7', accent: '#7cc4ff', onAccent: '#0b1622' },
  paper:    { label: 'Paper',    bg: '#f4f1ea', surface: '#fffdf8', text: '#2b2620', muted: '#857e70', accent: '#b3541e', onAccent: '#fff6ec' },
  forest:   { label: 'Forest',   bg: '#0d1512', surface: '#14211a', text: '#e3ede6', muted: '#8fa598', accent: '#7ed491', onAccent: '#0a1c10' },
  sunset:   { label: 'Sunset',   bg: '#1a1214', surface: '#251922', text: '#f6e8e2', muted: '#b39aa0', accent: '#ff9e64', onAccent: '#2a130a' },
  ocean:    { label: 'Ocean',    bg: '#081020', surface: '#0e1b30', text: '#e2eaf6', muted: '#8296b4', accent: '#54c2ff', onAccent: '#06131f' },
};

const DEFAULT_CONFIG = {
  version: 2,
  layout: 'minimal_launcher',
  greeting: 'Welcome back',
  name: 'friend',
  showClock: true,
  showSearch: true,
  engine: 'duckduckgo',
  theme: 'midnight',
  accent: null,           // null = palette default
  background: 'glow',     // glow | gradient | flat
  categories: [
    {
      name: 'Daily',
      links: [
        { name: 'Gmail', url: 'https://mail.google.com', emoji: '✉️' },
        { name: 'Calendar', url: 'https://calendar.google.com', emoji: '📅' },
        { name: 'Drive', url: 'https://drive.google.com', emoji: '📁' },
        { name: 'Weather', url: 'https://weather.gov', emoji: '⛅' },
      ],
    },
    {
      name: 'Dev',
      links: [
        { name: 'GitHub', url: 'https://github.com', emoji: '' },
        { name: 'Stack Overflow', url: 'https://stackoverflow.com', emoji: '' },
        { name: 'MDN', url: 'https://developer.mozilla.org', emoji: '' },
        { name: 'CodePen', url: 'https://codepen.io', emoji: '' },
      ],
    },
    {
      name: 'Fun',
      links: [
        { name: 'YouTube', url: 'https://youtube.com', emoji: '▶️' },
        { name: 'Reddit', url: 'https://reddit.com', emoji: '' },
        { name: 'Spotify', url: 'https://open.spotify.com', emoji: '🎧' },
        { name: 'Perchance', url: 'https://perchance.org', emoji: '🎲' },
      ],
    },
  ],
};

/* ---------------- State ---------------- */

let config = structuredClone(DEFAULT_CONFIG);

/* ---------------- Utilities ---------------- */

const $ = (sel) => document.querySelector(sel);

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeUrl(url) {
  const u = String(url || '').trim();
  if (/^https?:\/\//i.test(u)) { try { const parsed = new URL(u); return parsed.hostname && !parsed.username && !parsed.password ? parsed.href : ''; } catch { return ''; } }
  if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(u)) return sanitizeUrl('https://' + u);
  return '';
}

function normalizeUrl(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  return sanitizeUrl(u);
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2600);
}

function download(filename, content, type = 'text/html') {
  const blob = new Blob([content], { type: type + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/* ---------------- Rendering: colors + CSS ---------------- */

function palette() {
  const t = THEMES[config.theme] || THEMES.midnight;
  return {
    bg: t.bg,
    surface: t.surface,
    text: t.text,
    muted: t.muted,
    accent: config.accent || t.accent,
    onAccent: t.onAccent,
  };
}

function backgroundStyle(p) {
  if (config.background === 'flat') return `background: ${p.bg};`;
  if (config.background === 'gradient') {
    return `background: linear-gradient(150deg, ${p.bg} 0%, ${p.surface} 100%);`;
  }
  return `background:\n    radial-gradient(1100px 500px at 50% -160px, ${p.accent}14, transparent 70%),\n    ${p.bg};`;
}

function startpageCss(scope = '') {
  const p = palette();
  const s = scope; // '' for export, '.sp-scope ' for preview
  return `${layoutCss(s)}\n${s}.startpage {
  min-height: 100dvh;
  ${backgroundStyle(p)}
  color: ${p.text};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 56px 24px 72px;
  box-sizing: border-box;
  container-type: inline-size;
}
${s}.startpage *,
${s}.startpage *::before,
${s}.startpage *::after { box-sizing: border-box; margin: 0; padding: 0; }

${s}.sp-hero { text-align: center; display: flex; flex-direction: column; gap: 8px; }

${s}.sp-clock {
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

${s}.sp-greeting {
  font-size: clamp(1.05rem, 2.5vw, 1.35rem);
  color: ${p.muted};
  font-weight: 500;
}

${s}.sp-greeting strong { color: ${p.text}; font-weight: 700; }

${s}.sp-search {
  width: min(620px, 100%);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

${s}.sp-search input {
  flex: 1;
  min-width: 0;
  background: ${p.surface};
  border: 1px solid ${p.muted}55;
  border-radius: 12px;
  color: ${p.text};
  font-size: 1rem;
  padding: 13px 18px;
  outline: none;
}

${s}.sp-search input::placeholder { color: ${p.muted}; }

${s}.sp-search input:focus {
  border-color: ${p.accent};
  box-shadow: 0 0 0 3px ${p.accent}33;
}

${s}.sp-search button {
  background: ${p.accent};
  color: ${p.onAccent};
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  border-radius: 12px;
  padding: 13px 22px;
  cursor: pointer;
}

${s}.sp-search button:hover { filter: brightness(1.08); }

${s}.sp-search select {
  background: ${p.surface};
  color: ${p.text};
  border: 1px solid ${p.muted}55;
  border-radius: 12px;
  padding: 0 12px;
  font-size: 0.9rem;
  cursor: pointer;
  flex: none;
  min-width: 120px;
}

${s}.sp-categories {
  width: min(920px, 100%);
  display: flex;
  flex-direction: column;
  gap: 36px;
}

${s}.sp-category h2 {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${p.muted};
  margin-bottom: 14px;
}

${s}.sp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 12px;
}

${s}.sp-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${p.surface};
  border: 1px solid ${p.muted}30;
  border-radius: 14px;
  padding: 18px 8px 14px;
  text-decoration: none;
  color: ${p.text};
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

${s}.sp-tile:hover {
  transform: translateY(-3px);
  border-color: ${p.accent};
  box-shadow: 0 8px 20px ${p.bg}80;
}

${s}.sp-tile .sp-icon { font-size: 26px; line-height: 1; min-height: 26px; display: flex; align-items: center; }
${s}.sp-tile .sp-label {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  overflow-wrap: anywhere;
}

${s}.sp-footer {
  font-size: 0.72rem;
  color: ${p.muted};
  opacity: 0.75;
}

${s}.sp-footer a { color: inherit; }

@container (max-width: 520px) {
  ${s}.sp-search { flex-direction: column; }
  ${s}.sp-search select, ${s}.sp-search button { width: 100%; }
  ${s}.sp-categories { gap: 28px; }
}`;
}

/* ---------------- Rendering: markup ---------------- */

function layoutCss(s = '') {
  // These styles are shared by preview and standalone HTML export.
  return `
${s}.startpage[data-layout="focus_card"] .sp-hero { padding: 36px; border: 1px solid currentColor; border-radius: 22px; }
${s}.startpage[data-layout="bookmark_grid"] { gap: 22px; padding-top: 28px; }
${s}.startpage[data-layout="bookmark_grid"] .sp-categories { width: min(1100px,100%); }
${s}.startpage[data-layout="three_column_dashboard"] .sp-categories { width: 100%; display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; }
${s}.startpage[data-layout="three_column_dashboard"] .sp-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
${s}.startpage[data-layout="bento_grid"] .sp-categories { width: 100%; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 20px; }
${s}.startpage[data-layout="bento_grid"] .sp-category:first-child { grid-column: 1/-1; }
${s}.startpage[data-layout="kanban"] .sp-categories { width: 100%; display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; }
${s}.startpage[data-layout="kanban"] .sp-category { padding: 16px; border: 1px solid currentColor; border-radius: 14px; }
${s}.startpage[data-layout="kanban"] .sp-grid { grid-template-columns: 1fr; }
${s}.startpage[data-layout="news_reader"] .sp-categories { width: min(780px,100%); gap: 12px; }
${s}.startpage[data-layout="news_reader"] .sp-grid { grid-template-columns: 1fr; }
${s}.startpage[data-layout="news_reader"] .sp-tile { flex-direction: row; justify-content: flex-start; padding: 10px 18px; }
${s}.startpage[data-layout="command_palette"] .sp-search { order: -1; width: min(760px,100%); }
${s}.startpage[data-layout="command_palette"] .sp-hero { font-size: .85em; }
@container (max-width: 640px) {
  ${s}.startpage[data-layout] .sp-categories { display: flex; flex-direction: column; }
  ${s}.startpage[data-layout="three_column_dashboard"] .sp-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
}`;
}

function startpageMarkup(forExport = false) {
  const p = palette();
  const engine = ENGINES[config.engine] || ENGINES.duckduckgo;
  let html = '';

  if (config.showClock) {
    const greeting = forExport ? '__GREETING__' : escapeHtml(config.greeting);
    html += `    <div class="sp-hero">
      <div class="sp-clock" data-testid="sp-clock">--:--</div>
      <div class="sp-greeting">${greeting}, <strong>${escapeHtml(config.name || 'friend')}</strong></div>
    </div>\n`;
  }

  if (config.showSearch) {
    html += `    <form class="sp-search" onsubmit="return spSearch(event)">
      <input type="text" name="q" placeholder="Search the web…" aria-label="Search the web" data-testid="sp-search-input" />
      <select name="engine" aria-label="Search engine">__ENGINE_OPTIONS__</select>
      <button type="submit">Search</button>
    </form>\n`;
  }

  if (config.categories.length) {
    html += `    <div class="sp-categories">\n`;
    for (const cat of config.categories) {
      if (!cat.links.length) continue;
      html += `      <section class="sp-category">
        <h2>${escapeHtml(cat.name || 'Links')}</h2>
        <div class="sp-grid">\n`;
      for (const link of cat.links) {
        const url = normalizeUrl(link.url);
        if (!url) continue;
        const icon = link.emoji ? escapeHtml(link.emoji) : '🔗';
        html += `          <a class="sp-tile" href="${escapeHtml(url)}">${icon ? `<span class="sp-icon">${icon}</span>` : ''}<span class="sp-label">${escapeHtml(link.name || url)}</span></a>\n`;
      }
      html += `        </div>
      </section>\n`;
    }
    html += `    </div>\n`;
  }

  html += `    <footer class="sp-footer">My Start · powered by <a href="https://brightideatech.com" target="_blank" rel="noopener">Bright Idea Technology Solutions LLC</a></footer>\n`;

  return html;
}

function engineOptions() {
  return Object.entries(ENGINES)
    .map(([id, e]) => `            <option value="${id}"${id === config.engine ? ' selected' : ''}>${escapeHtml(e.name)}</option>`)
    .join('\n');
}

/* ---------------- Preview ---------------- */

function renderPreview() {
  const root = $('#preview-root');
  let markup = startpageMarkup(false);
  const options = engineOptions();
  markup = markup.replace('__ENGINE_OPTIONS__', options);
  root.innerHTML = `<div class="startpage" data-layout="${config.layout}">\n${markup}    </div>`;

  const styleId = 'preview-style';
  let styleEl = document.getElementById(styleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = startpageCss('.sp-scope ');

  // Wire the preview search so it feels real (opens engine in new tab)
  const form = root.querySelector('.sp-search');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = form.querySelector('input[name="q"]').value.trim();
      const engineId = form.querySelector('select[name="engine"]').value;
      if (q) window.open((ENGINES[engineId] || ENGINES.duckduckgo).url + encodeURIComponent(q), '_blank');
    });
  }

  updatePreviewClock();
}

function updatePreviewClock() {
  if (!config.showClock) return;
  const clockEl = $('#preview-root .sp-clock');
  if (!clockEl) return;
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

setInterval(updatePreviewClock, 15000);

/* ---------------- Export: standalone HTML ---------------- */

function buildExportHtml() {
  const p = palette();
  const title = `My Start — ${escapeHtml(config.name || 'Home')}`;
  let markup = startpageMarkup(true);
  markup = markup
    .replace(/__GREETING__/g, escapeHtml(config.greeting))
    .replace('__ENGINE_OPTIONS__', engineOptions());

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="generator" content="My Start (mystart.imine.me)" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='${encodeURIComponent(p.bg)}'/%3E%3Ccircle cx='16' cy='16' r='7' fill='${encodeURIComponent(p.accent)}'/%3E%3C/svg%3E" />
  <style>
${startpageCss('')}
  </style>
</head>
<body>
  <div class="startpage" data-layout="${config.layout}">
${markup}  </div>
  <script>
    // Greeting by time of day
    (function () {
      var g = document.querySelector('.sp-greeting');
      if (!g) return;
      var h = new Date().getHours();
      var t = h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
      g.replaceChildren(document.createTextNode(t + ', '));
      var strong = document.createElement('strong');
      strong.textContent = ${JSON.stringify(config.name || 'friend').replace(/</g, '\\u003c')};
      g.appendChild(strong);
    })();
    // Clock
    (function tick() {
      var c = document.querySelector('.sp-clock');
      if (!c) return;
      function run() {
        c.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      run();
      setInterval(run, 15000);
    })();
    // Search
    function spSearch(e) {
      e.preventDefault();
      var form = e.target;
      var q = form.q.value.trim();
      if (!q) return false;
      var engines = ${JSON.stringify(ENGINES)};
      var url = (engines[form.engine.value] || engines.duckduckgo).url + encodeURIComponent(q);
      window.location.href = url;
      return false;
    }
  <\/script>
</body>
</html>
`;
}

function exportHtml() {
  const html = buildExportHtml();
  const slug = (config.name || 'startpage').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'startpage';
  download(`${slug}-startpage.html`, html);
  toast('startpage HTML downloaded');
}

/* ---------------- Export: Perchance generator ---------------- */

function buildPerchanceCode() {
  const p = palette();
  const engine = ENGINES[config.engine] || ENGINES.duckduckgo;
  const name = escapeHtml(config.name || 'friend');

  let linksHtml = '';
  for (const cat of config.categories) {
    if (!cat.links.length) continue;
    linksHtml += `      <section class="sp-category">\n        <h2>${escapeHtml(cat.name || 'Links')}</h2>\n        <div class="sp-grid">\n`;
    for (const link of cat.links) {
      const url = normalizeUrl(link.url);
      if (!url) continue;
      const icon = link.emoji ? escapeHtml(link.emoji) : '🔗';
      linksHtml += `          <a class="sp-tile" href="${escapeHtml(url)}"><span class="sp-icon">${icon}</span><span class="sp-label">${escapeHtml(link.name || url)}</span></a>\n`;
    }
    linksHtml += `        </div>\n      </section>\n`;
  }

  const searchBlock = config.showSearch
    ? `    <form class="sp-search" onsubmit="var q=this.q.value.trim(); if(q){ window.location.href='${engine.url}'+encodeURIComponent(q); } return false;">
      <input type="text" name="q" placeholder="Search with ${escapeHtml(engine.name)}…" aria-label="Search" />
      <button type="submit">Search</button>
    </form>\n`
    : '';

  const heroBlock = config.showClock
    ? `    <div class="sp-hero">
      <div class="sp-greeting">[greeting], <strong>${name}</strong></div>
      <div class="sp-sub">[message]</div>
    </div>\n`
    : `    <div class="sp-hero">
      <div class="sp-greeting">[greeting], <strong>${name}</strong></div>
    </div>\n`;

  return `output
  <div class="startpage" data-layout="${config.layout}">
${heroBlock}${searchBlock}${linksHtml}    <footer class="sp-footer">My Start · powered by <a href="https://brightideatech.com">Bright Idea Technology Solutions LLC</a></footer>
  </div>
  <style>
${startpageCss('    .startpage ')}
  </style>

greeting
  Good morning
  Good afternoon
  Good evening
  Welcome back
  Hey there
${config.showClock ? '' : ''}
message
  Have a great day.
  Make it count.
  One link at a time.
  The internet is yours today.
`;
}

function exportPerchance() {
  const code = buildPerchanceCode();
  $('#perchance-code').textContent = code;
  $('#perchance-modal').hidden = false;
}

/* ---------------- Export / import config ---------------- */

function exportJson() {
  const json = JSON.stringify(config, null, 2);
  download('startpage-forge-config.json', json, 'application/json');
  toast('Config saved');
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object' || !Array.isArray(data.categories)) {
        throw new Error('missing categories');
      }
      if (!data.categories.every(cat => cat && typeof cat.name === 'string' && Array.isArray(cat.links) && cat.links.every(link => link && typeof link.name === 'string' && typeof link.url === 'string' && (link.emoji === undefined || typeof link.emoji === 'string')))) throw new Error('invalid categories');
      config = Object.assign(structuredClone(DEFAULT_CONFIG), data);
      config.layout = getLayout(config.layout) ? config.layout : 'minimal_launcher';
      config.theme = Object.hasOwn(THEMES, config.theme) ? config.theme : 'midnight';
      config.engine = Object.hasOwn(ENGINES, config.engine) ? config.engine : 'duckduckgo';
      config.background = ['glow', 'gradient', 'flat'].includes(config.background) ? config.background : 'glow';
      config.accent = /^#[0-9a-fA-F]{6}$/.test(config.accent) ? config.accent : null;
      renderAll();
      toast('Config imported');
    } catch (err) {
      toast('Could not read that file — is it a My Start config?');
    }
  };
  reader.readAsText(file);
}

/* ---------------- Editor rendering ---------------- */

function renderIdentity() {
  $('#input-greeting').value = config.greeting;
  $('#input-name').value = config.name;
  setSwitch('#toggle-clock', config.showClock);
  setSwitch('#toggle-search', config.showSearch);

  const engineSel = $('#select-engine');
  engineSel.innerHTML = Object.entries(ENGINES)
    .map(([id, e]) => `<option value="${id}"${id === config.engine ? ' selected' : ''}>${escapeHtml(e.name)}</option>`)
    .join('');
  engineSel.value = config.engine;

  const bgSel = $('#select-background');
  bgSel.value = config.background;

  const accentInput = $('#input-accent');
  accentInput.value = config.accent || THEMES[config.theme].accent;
}

function setSwitch(sel, on) {
  const el = $(sel);
  el.setAttribute('aria-checked', on ? 'true' : 'false');
}

function renderThemeSwatches() {
  const wrap = $('#theme-swatches');
  wrap.innerHTML = '';
  for (const [id, t] of Object.entries(THEMES)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch' + (config.theme === id ? ' is-active' : '');
    btn.dataset.testid = `swatch-${id}`;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', config.theme === id ? 'true' : 'false');
    btn.setAttribute('aria-label', t.label);
    btn.title = t.label;
    btn.style.background = `linear-gradient(150deg, ${t.bg}, ${t.surface})`;
    btn.innerHTML = `<span class="swatch-name" style="color:${t.text}">${t.label}</span><span class="swatch-dot" style="background:${t.accent}"></span>`;
    btn.addEventListener('click', () => {
      config.theme = id;
      if (!config.accent) $('#input-accent').value = THEMES[id].accent;
      renderAll();
    });
    wrap.appendChild(btn);
  }
}

function renderCategoriesEditor() {
  const wrap = $('#categories-editor');
  wrap.innerHTML = '';

  config.categories.forEach((cat, ci) => {
    const block = document.createElement('div');
    block.className = 'category-block';
    block.dataset.testid = `category-block-${ci}`;

    const head = document.createElement('div');
    head.className = 'category-head';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = cat.name;
    nameInput.dataset.testid = `input-category-name-${ci}`;
    nameInput.setAttribute('aria-label', 'Category name');
    nameInput.addEventListener('input', () => { cat.name = nameInput.value; renderPreview(); });
    head.appendChild(nameInput);

    const removeCat = document.createElement('button');
    removeCat.type = 'button';
    removeCat.className = 'row-remove';
    removeCat.dataset.testid = `button-remove-category-${ci}`;
    removeCat.setAttribute('aria-label', 'Remove category');
    removeCat.textContent = '×';
    removeCat.addEventListener('click', () => {
      config.categories.splice(ci, 1);
      renderAll();
    });
    head.appendChild(removeCat);
    block.appendChild(head);

    cat.links.forEach((link, li) => {
      const row = document.createElement('div');
      row.className = 'link-row';
      row.dataset.testid = `link-row-${ci}-${li}`;

      const emoji = document.createElement('input');
      emoji.type = 'text';
      emoji.className = 'icon-input';
      emoji.value = link.emoji || '';
      emoji.maxLength = 4;
      emoji.dataset.testid = `input-link-emoji-${ci}-${li}`;
      emoji.setAttribute('aria-label', 'Icon emoji');
      emoji.placeholder = '🔗';
      emoji.addEventListener('input', () => { link.emoji = emoji.value; renderPreview(); });

      const name = document.createElement('input');
      name.type = 'text';
      name.value = link.name;
      name.dataset.testid = `input-link-name-${ci}-${li}`;
      name.setAttribute('aria-label', 'Link name');
      name.placeholder = 'Name';
      name.addEventListener('input', () => { link.name = name.value; renderPreview(); });

      const url = document.createElement('input');
      url.type = 'text';
      url.value = link.url;
      url.dataset.testid = `input-link-url-${ci}-${li}`;
      url.setAttribute('aria-label', 'Link URL');
      url.placeholder = 'example.com';
      url.addEventListener('input', () => { link.url = url.value; renderPreview(); });

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'row-remove';
      remove.dataset.testid = `button-remove-link-${ci}-${li}`;
      remove.setAttribute('aria-label', 'Remove link');
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        cat.links.splice(li, 1);
        renderAll();
      });

      row.append(emoji, name, url, remove);
      block.appendChild(row);
    });

    const addLink = document.createElement('button');
    addLink.type = 'button';
    addLink.className = 'btn-mini';
    addLink.dataset.testid = `button-add-link-${ci}`;
    addLink.textContent = '+ Add link';
    addLink.addEventListener('click', () => {
      cat.links.push({ name: '', url: '', emoji: '' });
      renderAll();
    });
    block.appendChild(addLink);

    wrap.appendChild(block);
  });
}

function renderAll() {
  $('#select-layout').value = config.layout;
  renderIdentity();
  renderThemeSwatches();
  renderCategoriesEditor();
  renderPreview();
}

/* ---------------- Event wiring ---------------- */

function wireEvents() {
  $('#select-layout').addEventListener('change', e => { if (getLayout(e.target.value)) { config.layout = e.target.value; renderPreview(); } });
  $('#input-greeting').addEventListener('input', (e) => { config.greeting = e.target.value; renderPreview(); });
  $('#input-name').addEventListener('input', (e) => { config.name = e.target.value; renderPreview(); });

  $('#toggle-clock').addEventListener('click', () => { config.showClock = !config.showClock; setSwitch('#toggle-clock', config.showClock); renderPreview(); });
  $('#toggle-search').addEventListener('click', () => { config.showSearch = !config.showSearch; setSwitch('#toggle-search', config.showSearch); renderPreview(); });

  $('#select-engine').addEventListener('change', (e) => { config.engine = e.target.value; renderPreview(); });
  $('#select-background').addEventListener('change', (e) => { config.background = e.target.value; renderPreview(); });

  $('#input-accent').addEventListener('input', (e) => { config.accent = e.target.value; renderPreview(); });
  $('#btn-accent-reset').addEventListener('click', () => {
    config.accent = null;
    $('#input-accent').value = THEMES[config.theme].accent;
    renderPreview();
  });

  $('#btn-add-category').addEventListener('click', () => {
    config.categories.push({ name: 'New category', links: [{ name: '', url: '', emoji: '' }] });
    renderAll();
  });

  $('#btn-export-html').addEventListener('click', exportHtml);
  $('#btn-export-json').addEventListener('click', exportJson);
  $('#btn-export-perchance').addEventListener('click', exportPerchance);

  $('#btn-import').addEventListener('click', () => $('#file-input').click());
  $('#file-input').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) importJson(e.target.files[0]);
    e.target.value = '';
  });

  $('#btn-reset').addEventListener('click', () => {
    config = structuredClone(DEFAULT_CONFIG);
    renderAll();
    toast('Reset to defaults');
  });

  $('#btn-close-modal').addEventListener('click', () => { $('#perchance-modal').hidden = true; });
  $('#perchance-modal').addEventListener('click', (e) => {
    if (e.target === $('#perchance-modal')) $('#perchance-modal').hidden = true;
  });

  $('#btn-copy-perchance').addEventListener('click', async () => {
    const code = $('#perchance-code').textContent;
    try {
      await navigator.clipboard.writeText(code);
      toast('Copied to clipboard');
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('#perchance-code'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      toast('Select and copy the code (clipboard blocked)');
    }
  });

  $('#btn-download-perchance').addEventListener('click', () => {
    download('startpage-generator.perchance.txt', $('#perchance-code').textContent, 'text/plain');
  });

  document.querySelectorAll('.vp-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vp-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
      $('#preview-frame').classList.toggle('is-mobile', btn.dataset.vp === 'mobile');
      const root = $('#preview-root');
      if (btn.dataset.vp === 'mobile') root.style.maxWidth = '390px';
      else root.style.maxWidth = '';
    });
  });
}

/* ---------------- Boot ---------------- */

wireEvents();
renderAll();
