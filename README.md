# chiwooroh.github.io

Personal academic site — plain static HTML/CSS/JS. No Jekyll, no build step.

## Structure

```
index.html            Home — photo, bio, research interests, news, selected publications, awards, education
research.html         Research — three topics, each with a figure and narrative
publications.html     Full publication list with filter tabs
employment.html       Research positions and research visits
teaching.html         Lecturing and teaching assistantships
projects.html         Funded projects and patents
news.html             Full news archive
.nojekyll             Tells GitHub Pages to serve files as-is (skips Jekyll)
assets/
  styles.css          Entire design system (color tokens, type, layout)
  script.js           Theme toggle, copy-email, JSON rendering
  Chiwoo_Roh_CV.pdf   Linked from every page
  profile.jpg         Hero photo
  favicon*.png/.ico   Carried over from the old site
  logos/              Institution marks used on the Employment page
  figures/            Publication and section figures
data/
  news.json           News items (newest first is enforced in code)
  publications.json   All publications
  projects.json       Funded projects (USD figures are converted, see the page lead)
```

## Updating content

You should almost never need to touch HTML.

**Add a news item** — prepend to `data/news.json`:

```json
{
  "date": "2026-03",
  "label": "Mar 2026",
  "text": "Paper accepted to <strong>Transportation Research Part C</strong>."
}
```

`date` is used for sorting (`YYYY-MM`), `label` is what readers see.

After editing anything under `data/`, bump `DATA_V` at the top of `assets/script.js`
so browsers do not keep serving the copy they already have.

**Add a publication** — add to `data/publications.json`:

```json
{
  "type": "journal",
  "year": 2026,
  "selected": true,
  "figure": "assets/figures/my-figure.jpg",
  "badge": "TRB",
  "award": "Best Paper Award",
  "title": "Paper title",
  "authors": "**Roh, C.**, & Won, M.",
  "venue": "Journal name, 45(2)",
  "links": { "paper": "https://...", "code": "https://..." }
}
```

- `type` — `journal` | `conference` | `review`. This drives the home page counters,
  the filter tabs, and the order of the full list: journal articles, then manuscripts
  under review, then conference papers, each sorted by year within its group.
- `**Name**` in `authors` renders your own name highlighted with an amber underline
- `selected: true` puts it in the home page's three-item Selected Publications block
  (only the first three selected entries are shown, in file order)
- `award`, `figure` and `links` are optional. `badge` is still accepted in the
  data but no longer rendered — the venue line and the group heading already say it

## Still worth replacing

1. **Publication figures.** `assets/figures/*.svg` are placeholder diagrams drawn to
   stand in for the real thing. Export the actual figures from your papers at roughly
   1200×740 and point each entry's `figure` at them.
2. **Profile photo.** In the hero, `assets/profile.jpg` stretches to match the height
   of the text beside it, so the two columns end level. That frame is roughly 1:2, and
   on mobile it becomes 4:5 — a replacement works best as a portrait crop near 0.55
   aspect with the subject centered horizontally and the face in the upper third.
   Drop it in at the same path and bump the `?v=` on the `<img>` in `index.html`.
   `object-position` on `.profile-photo img` decides which part survives the mobile
   4:5 crop — lower the Y percentage if a new photo's head gets cut off there.
3. **CV.** `assets/Chiwoo_Roh_CV.pdf` is a copy of the August 2026 version. Re-copy it
   whenever the CV changes.

## Previewing locally

`fetch()` does not work over `file://`, so the JSON-driven sections will show an
error if you open the HTML directly. Run a server instead:

```bash
python3 -m http.server 8791
```

Then open <http://localhost:8791>.

## Deploying

These files live at the root of `Chiwooroh/chiwooroh.github.io` on the `master`
branch, which is what GitHub Pages serves. `.nojekyll` stops Pages from trying to
build the old AcademicPages Jekyll site.

The previous AcademicPages site is preserved on the `legacy` branch — nothing was
deleted from history.

## Design notes

- Cobalt `#1b4d8c` is the structural color: links, current nav item, accents.
- Sodium amber `#a85e1b` is used in exactly two places — your own name in an author
  list, and awards. Keeping it scarce is what makes it readable at a glance.
- Type: Source Serif 4 (name, section headings), Libre Franklin (body),
  IBM Plex Mono (dates, labels, data).
- The site is English-only. There is no language toggle.
- Both light and dark themes are defined at the token level in `:root`. Never write
  a color literal in a component rule — add or reuse a token instead.
- Every page runs to the same 1160px shell (`--w`) with 32px gutters, 20px on small
  screens. Section rules and the content under them share one measure.
- A research thread is three blocks: `.thread-lede`, `.thread-figure` and
  `.thread-work`. Above 900px the first two share a row and the work list runs the
  full width beneath them; below that they stack.
