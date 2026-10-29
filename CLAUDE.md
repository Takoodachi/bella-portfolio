# Bella Duong — portfolio site

Personal portfolio of Bella Duong (The Governor's Academy, Class of 2027), used for college admissions.
Live at **https://belladuong.com**. The person asking for changes is usually Bella herself and may not
know code — explain in plain words, make the change, check it, and publish it.

This repo is public and GitHub Pages serves it, so never put secrets or private details in any file.

## Stack and publishing

- Plain HTML, CSS and JS. No build step, no framework, no package manager.
- Fonts from Google Fonts; PDF.js 3.11.174 from cdnjs (only on pages with a PDF viewer).
- GitHub Pages builds from `main`, repo root. Push to `main` and the site updates in about a minute.
- `CNAME` holds `belladuong.com` — never delete it. `_config.yml` keeps `README.md` and this file off the live site.
- Domain is registered at Mat Bao (matbao.net). DNS: four `A` records for `@` → `185.199.108.153`,
  `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `CNAME` for `www` → `<repo owner>.github.io`.
  If the repo moves to another GitHub account, the `www` record must be updated to the new owner.

## Files

| Tab (nav label) | File |
|---|---|
| Home (logo) | `index.html` |
| Writing | `writing.html` |
| Leadership & Community | `leadership.html` |
| Photography & Performance | `photography-performance.html` |
| About | `about.html` |
| Résumé ↗ | `contact.html` (résumé viewer + contact cards) |

- `css/style.css` — the only stylesheet. Colors are tokens on `:root` (beige `--bg`, `--jade`, `--terracotta`, …).
- `js/main.js` — every page: page transitions, scroll reveals, nav, cursor, lightbox, story cards,
  Chapters slider, piece reader, back-to-top button.
- `js/pdf-viewer.js` — PDF.js reader. Wires up only the **first** `.pdf-viewer` on a page.
  Add `data-continuous` to stack all pages in one scroll (the résumé uses it); without it, prev/next paging.
- `js/magazine.js` — Governor's Review flip-book on Writing; paginates `.mag-flow` automatically.
- `assets/<section>/<section>-NN.jpg` for photos; `assets/docs/` for PDFs.

## Rules that are easy to break

- **Shared chrome is copied into every page**: header `.nav-links`, mobile `.nav-overlay`, and the footer
  "Explore" list. Change all six pages together, keep the sitemap order above, and mark the current page's
  desktop link `class="active"`. The last nav item is styled as the dark pill. The menu button replaces
  the nav below 1000px wide — check that new or longer labels don't wrap.
- **Cache-busting**: every page loads `css/style.css`, `js/*.js` with `?v=N` (currently `v=13`).
  After changing any CSS or JS file, bump N on every page.
- **Vietnamese text** in headings or other Libre Baskerville text needs `class="vi"` (the font has no
  Vietnamese glyphs; `.vi` switches to Noto Serif).
- **Scroll reveals**: add `class="reveal"` (+ `reveal-left` / `reveal-right` / `reveal-scale`), delay with
  `style="--delay:.2s"`, or `data-stagger="0.1"` on a parent. Content visible on load also gets `in-view`.
- Two-column grids use `minmax(0, 1fr)` so wide content (canvas, images) can't stretch a column.
- Creative writing: each piece is a `.cw-item` plus `<template id="piece-N">` holding the full text;
  reading time is words ÷ 230, rounded up.
- New photos: resize to about 1800px on the long side, JPEG quality ~82 (Pillow is installed), lowercase
  `section-NN.jpg` names, real `alt` text, `loading="lazy"` below the fold.

## Content rules

- Don't repeat a photo within the same page.
- Privacy: the only contact detail on the site is Bella's email. Never publish her phone number or home
  address; strip them from any new résumé PDF before it goes into `assets/docs/`.
- Only Bella's own work, or photos she has permission to use, with credit where due. Third-party
  copyrighted images (e.g. newspaper cartoons) stay off the site.
- No editor-facing notes on the visible page — use HTML comments.
- `<!-- DRAFT COPY -->` marks text written as a stand-in for Bella's own words; `<!-- PLACEHOLDER -->`
  marks content still missing (LinkedIn URL, performance and AAFC videos, poetry, The Spire link,
  Junior Thesis, Special Olympics photos). Remove the marker when the real content goes in.

## Checking a change

- Local preview: `.claude/launch.json` → "bella-portfolio" (`python -m http.server 8321`).
- Add `?fresh=N` to page URLs to dodge the browser's HTML cache.
- Check desktop (~1440px) and phone (375px) widths, the browser console, and that nav links work.
- After pushing, confirm the change on https://belladuong.com.
