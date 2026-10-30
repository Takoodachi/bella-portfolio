# Bella Duong — portfolio site

Personal portfolio of Bella Duong (The Governor's Academy, Class of 2027), used for college admissions.
Live at **https://belladuong.com**. The person asking for changes is usually Bella herself and may not
know code — explain in plain words, make the change, check it, and publish it.

This repo is public and GitHub Pages serves it, so never put secrets or private details in any file.

## How the site is built

- **Content** (every word, photo, link, video and PDF) lives in `_data/*.yml`. Bella edits it in the
  browser at **belladuong.com/admin** (Sveltia CMS); each save is a commit to `main`.
- **Design** lives in the page templates (`index.html`, `writing.html`, … — front matter + Liquid),
  `_layouts/default.html` (head, menus, footer, scripts), `_includes/` (shared pieces), `css/style.css`
  and `js/`. GitHub Pages runs Jekyll on every push to `main`; the site updates in about a minute.
- Plain HTML/CSS/JS otherwise: no framework, no package manager. PDF.js 3.11.174 from cdnjs.
- `CNAME` holds `belladuong.com` — never delete it. `_config.yml` keeps `README.md`, this file and `tools/`
  off the live site, and sets Kramdown to leave quotes and dashes exactly as typed.

## Files

| Tab (nav label) | Template | Content |
|---|---|---|
| Home (logo) | `index.html` | `_data/home.yml` |
| Writing | `writing.html` | `_data/writing.yml` |
| Leadership & Community | `leadership.html` | `_data/leadership.yml` |
| Photography & Performance | `photography-performance.html` | `_data/photography.yml` |
| About | `about.html` | `_data/about.yml` |
| Résumé ↗ | `contact.html` | `_data/resume.yml` |
| (every page) | `_layouts/default.html` | `_data/site.yml` (email, LinkedIn, résumé PDF, footer), `_data/nav.yml` (site map — not in the editor) |

- `admin/index.html` loads Sveltia CMS; `admin/config.yml` defines every editable field. Field names must
  match the keys in `_data/*.yml`, and the editor only saves fields it knows — so when you add, rename or
  remove content, update the template, the data file **and** `admin/config.yml`, then run
  `python tools/check_cms.py` (it must print OK).
- `_includes/`: `hero.html` (inner-page hero), `md.html` / `mdi.html` (Markdown → HTML; external links get
  `target="_blank"`), `img.html`, `card.html`, `honors.html`, `stats.html` (big-number row), `video.html` (YouTube/Vimeo link → embed, else
  a "coming soon" box), `linkedin.html` (real profile once `site.yml` has one).
- `js/main.js` — page transitions, scroll reveals, nav, cursor, lightbox, story cards, Chapters slider,
  piece reader, back-to-top, and `markVietnamese()` (see below).
- `js/pdf-viewer.js` — wires up only the **first** `.pdf-viewer` on a page; `data-continuous` stacks all pages.
- `js/magazine.js` — Governor's Review flip-book; paginates `.mag-flow` at runtime.

## Rules that are easy to break

- **Cache-busting**: after changing anything in `css/` or `js/`, bump `assets_version` in `_config.yml`.
- **Automatic numbering** — don't hard-code it: vignette numbers and reading time (words ÷ 230) on Writing,
  "My stories.0N" and "Value 0N" on About, chapter numbers on Home, and scrapbook captions/alt text
  ("№ 03", "Photograph 3 …") when left empty.
- **Vietnamese text** in Libre Baskerville has no glyphs; `markVietnamese()` in `main.js` wraps such text
  in `.vi` (Noto Serif) at load, so editor content needs no markup.
- **Menus** come from `_data/nav.yml`; the last item is styled as the dark pill, and the menu button
  replaces the nav below 1000px — check that longer labels don't wrap.
- **Scroll reveals**: `class="reveal"` (+ `reveal-left` / `-right` / `-scale`), `style="--delay:.2s"`, or
  `data-stagger` on a parent. Content visible on load also gets `in-view`.
- Two-column grids use `minmax(0, 1fr)` so wide content can't stretch a column.
- Uploads from the editor are converted to WebP (max 2000px) and land in `assets/`.

## Content rules

- Don't repeat a photo within the same page.
- Privacy: the only contact detail on the site is Bella's email. Never publish her phone number or home
  address; strip them from any résumé PDF before it goes in.
- Only Bella's own work, or photos she has permission to use, with credit where due. Third-party
  copyrighted images (e.g. newspaper cartoons) stay off the site.
- Some text is still stand-in wording written for Bella to replace (home tagline and intro, About intro,
  story-card headlines and values, the AAFC recap, the Photography & Performance hero line, artist
  statement and performance reflections). Still missing: LinkedIn URL, performance and AAFC videos, poems,
  The Spire link, Junior Thesis, Special Olympics photos.

## Editor sign-in (Sveltia CMS)

- "Sign in with GitHub" goes through the Cloudflare Worker **sveltia-cms-auth**
  (`https://sveltia-cms-auth.takoodachi.workers.dev`, source: github.com/sveltia/sveltia-cms-auth) and a
  GitHub OAuth app whose callback is that URL + `/callback`. The worker holds `GITHUB_CLIENT_ID` and
  `GITHUB_CLIENT_SECRET` as secrets and `ALLOWED_DOMAINS` as a variable. When redeploying it, pass
  `--var "ALLOWED_DOMAINS:belladuong.com, www.belladuong.com"` or the domain restriction is dropped.
- The editor asks only for the `public_repo` scope. Anyone editing needs write access to this repo.
- Domain is registered at Mat Bao (matbao.net). DNS: four `A` records for `@` → `185.199.108.153`,
  `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `CNAME` for `www` → `<repo owner>.github.io`.
  If the repo moves to another GitHub account, update the `www` record, `backend.repo` in
  `admin/config.yml`, and `GITHUB_REPOSITORY` in `tools/preview.sh`.

## Checking a change

- Local preview: `.claude/launch.json` → "bella-portfolio" runs `tools/preview.sh`, which builds the site
  with GitHub's own Jekyll image (Docker must be running) into `_site/` and serves it on :8321.
  Restart it after each change. Without Docker, push and check the live site.
- Add `?fresh=N` to page URLs to dodge the browser's HTML cache.
- Check desktop (~1440px) and phone (375px) widths, the browser console, and that nav links work.
- After pushing, confirm the change on https://belladuong.com.
