# How to update belladuong.com

Everything in this folder **is** the website. When you save a change here (GitHub calls it
"Commit changes"), belladuong.com updates by itself in 1–2 minutes. Every change is kept in the
history, so nothing is ever lost.

## Which file is which tab

| Tab on the site | File |
|---|---|
| Home | `index.html` |
| Writing | `writing.html` |
| Leadership & Community | `leadership.html` |
| Photography & Performance | `photography-performance.html` |
| About | `about.html` |
| Résumé | `contact.html` |

Photos are in the `assets` folder, sorted by section (`dance`, `theater`, `photography`, …).
PDFs (résumé, essay) are in `assets/docs`.

## Swap a photo

1. On belladuong.com, right-click the photo → **Open image in new tab**. The end of the address shows
   its folder and name, for example `assets/dance/dance-01.jpg`.
2. Get the new photo ready:
   - **JPG format.** iPhone photos are often HEIC, which most browsers can't show — export or share it as JPG.
   - **Not too big:** about 1800 pixels on the long side and under ~500 KB. The free site
     [squoosh.app](https://squoosh.app) can resize and shrink it.
   - **Similar shape** (landscape or portrait) to the old photo, because the frames crop to fit.
3. Rename it to **exactly** the old name, e.g. `dance-01.jpg` (lowercase, same ending).
4. On GitHub, open that folder (`assets` → `dance`), click **Add file → Upload files**, drag the photo in,
   type a short note like "New dance photo", and click **Commit changes**.
5. Wait 1–2 minutes, then reload belladuong.com with **Ctrl+Shift+R** (Mac: **Cmd+Shift+R**).

If the new photo shows something different, also update its description for screen readers: it's the
`alt="…"` text next to the file name in the page file (see "Change some text" below).

## Replace the résumé

1. **Remove your phone number and home address first** — the site is public. Email is fine.
2. Save the résumé as a PDF named exactly `bella-duong-resume.pdf`.
3. Upload it to `assets/docs` the same way as a photo. The Résumé tab and the About page both use it.

## Change some text

1. On GitHub, open the page's file (see the table) and click the **pencil** (Edit).
2. Press **Ctrl+F** (Mac: **Cmd+F**) and search for a few words of the sentence.
3. Change only the words. Leave anything inside `<` `>` exactly as it is. Write `&amp;` instead of `&`.
4. Click **Commit changes**.

You'll see notes like `<!-- DRAFT COPY -->` above some paragraphs. Those were written as stand-ins —
rewrite them in your own words, then delete the note. `<!-- PLACEHOLDER -->` marks spots still waiting
for content.

## Bigger changes

Moving or adding sections, adding videos, new pages, or anything about the layout is easiest with
**Claude Code**: open this folder in the Code tab of the Claude desktop app and describe what you want
in plain words — for example "Move the Singing section above Theater" or "Add my LinkedIn link".
It reads `CLAUDE.md` for the website's rules, makes the change, checks it, and publishes it.

If something looks wrong after a change, ask it to "undo my last change to the website".

## Still waiting for content

- LinkedIn profile link (Résumé page, About page, and every page's footer)
- Performance videos (dance, theater, singing) and the Asian American Footsteps Conference video
- Poems for the Poetry section
- The link to *The Spire*
- Junior Thesis on yellow journalism
- Special Olympics photos

## Your domain

belladuong.com is registered at Mat Bao (matbao.net) and renews every year — keep **auto-renew** on,
or the address stops working and someone else could buy it. Don't change its DNS records unless the
website moves to a different GitHub account (`CLAUDE.md` has the details).
