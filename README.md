# My Start

**My Start** is a perchance-style **startpage generator platform** by [Bright Idea Technology Solutions LLC](https://brightideatech.com). Design your personal browser homepage in a live editor, then export it as a single self-contained HTML file — or as ready-to-paste Perchance generator code.

- Live prototype (Perchance front end): <https://perchance.org/mystart>
- Eventual release: <https://mystart.imine.me>

## Quick start

1. Open `index.html` in any modern browser (no build step, no dependencies, no server needed).
2. Edit your greeting, name, links, search engine and theme in the left panel — the right panel previews everything live.
3. Export:
   - **Export HTML** — downloads `your-name-startpage.html`, a fully self-contained page (inline CSS + JS, works offline). Set it as your browser homepage or new-tab page.
   - **Perchance code** — opens the generated Perchance generator source. Paste it into the **My Start** generator at [perchance.org/mystart](https://perchance.org/mystart) (open the code editor view with `#edit`). The greeting and message randomize on every load.
   - **Save config** — downloads a JSON snapshot of your setup; **Import config** restores it later.

## Features

- Clock with time-based greeting (good morning / afternoon / evening)
- Search bar with selectable engine: Google, DuckDuckGo, Bing, Startpage, Ecosia, Wikipedia
- Unlimited categories and links with optional emoji icons
- Five palettes (Midnight, Paper, Forest, Sunset, Ocean) plus a custom accent color
- Three background styles: soft glow, diagonal gradient, flat
- Live preview with desktop / mobile viewport toggle
- Imports and exports a portable JSON config

## Files

| File         | Purpose                                  |
| ------------ | ---------------------------------------- |
| `index.html` | Builder shell and modal UI              |
| `style.css`  | Builder styles                           |
| `app.js`     | Editor logic, preview, and exporters    |

## About the exports

**Standalone HTML** — one file, zero network requests, system font stack, works from `file://`. To use it as your homepage: Firefox → Settings → Home → Custom URLs → point it at the file.

**Perchance generator** — the exported code is a valid Perchance generator: an `output` block with your startpage HTML, plus `greeting` and `message` lists that Perchance randomizes on each load. Open [perchance.org/mystart](https://perchance.org/mystart) in the editor view (`#edit`), paste, and save. Note: the Perchance version renders a static greeting (Perchance regenerates the page on load, so a ticking clock is not included).

## Config format

`my-start-config.json` mirrors the internal state:

```json
{
  "greeting": "Welcome back",
  "name": "friend",
  "showClock": true,
  "showSearch": true,
  "engine": "duckduckgo",
  "theme": "midnight",
  "accent": null,
  "background": "glow",
  "categories": [
    { "name": "Daily", "links": [ { "name": "Gmail", "url": "https://mail.google.com", "emoji": "✉️" } ] }
  ]
}
```

Set `"accent": null` to follow the palette default, or any hex like `"#ff9e64"`.

## Browser support

Any current Chrome, Firefox, Edge or Safari. No frameworks, no build tools, no external requests at runtime.

---

Powered by [Bright Idea Technology Solutions LLC](https://brightideatech.com) · My Start © 2026
