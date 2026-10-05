# ppdung.github.io

Personal portfolio of **Phạm Phước Dũng** — C++/Qt developer working on
cross-platform point-of-sale, kitchen display and kiosk software.

**Live:** <https://ppdung.github.io> · **Tiếng Việt:** <https://ppdung.github.io/vi/>

A static single-page site, hand-written, no build step. Two language versions
are served as separate pages so each is indexable on its own.

## Layout

```
index.html          English site — content and structured data
vi/index.html       Vietnamese site — separate URL, paired via hreflang
404.html            Not-found page
css/
  style.css         The theme. Hand-edited; this is the source of truth.
  fonts.css         Inter + JetBrains Mono @font-face rules (also used by 404.html)
  icons.css         Subsetted icomoon + devicon glyph definitions
  bootstrap.css     Vendored Bootstrap 3.3.5, trimmed to the rules the pages use
js/
  site.js           All page behaviour, shared by both languages. No libraries.
fonts/
  inter/            Inter v20, variable woff2 per subset (latin, latin-ext, vietnamese)
  jetbrains-mono/   JetBrains Mono v24, the same three subsets
  icomoon/          21 glyphs, subsetted from the full icomoon set
  devicon/          17 glyphs, subsetted from devicon
images/             Avatar, project shots, favicon
sitemap.xml         Both language versions, with xhtml:link alternates
robots.txt
CV_PhamPhuocDung.pdf
```

## Notes for anyone editing this

- **`css/style.css` is the source of truth.** It is hand-edited. The original
  template's Sass sources were deleted because they had diverged completely and
  rebuilding from them would have wiped the current design.
- **The two language versions are independent files.** A content change in
  `index.html` needs the same change in `vi/index.html`.
- **The icon fonts are subsets.** Adding an icon means regenerating them:
  ```
  pyftsubset devicon.ttf --unicodes="U+E912,..." --flavor=woff2 \
    --output-file=fonts/devicon/devicon.woff2 --layout-features='' --no-hinting
  ```
  The codepoints in use are listed in `css/icons.css`.
- **The text fonts are self-hosted.** The files in `fonts/inter/` and
  `fonts/jetbrains-mono/` are the ones Google Fonts' css2 API serves a current
  Chrome; `css/fonts.css` keeps Google's unicode-ranges but declares latin-ext
  before vietnamese, so a Vietnamese letter never pulls in the 83 KB latin-ext
  file. Replacing them with another version means retuning the
  `Inter Fallback` metrics in the same file.
- **`css/bootstrap.css` is trimmed.** Only rules that apply somewhere on `/`
  or `/vi/` are left (found with Chrome's CSS rule-usage tracking over every
  width, menu, dialog, panel, form state, print and reduced motion). Markup
  that needs a Bootstrap class not in the file needs its rules copied back
  from Bootstrap 3.3.5's `dist/css/bootstrap.css`.
- **Behaviour lives in `js/site.js`, once, for both pages.** The only text in
  it that differs by language is the `STRINGS` table at the top, keyed by
  `<html lang>`. Each feature starts inside its own try/catch, so one failing
  cannot stop the others.
- **Reveal-on-scroll never hides content by itself.** `js/site.js` hides only
  boxes it has measured to be below the fold, so if the script does not load,
  everything is simply visible.

## Running it locally

Any static server; there is nothing to build.

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Note that `css/style.css` references images
relatively, so opening `index.html` directly from the filesystem also works.

## Deployment

GitHub Pages builds from `main`, root path. Pushing to `main` deploys.

## Third-party

Bootstrap's CSS and the fonts are vendored and marked `linguist-vendored` in
`.gitattributes`. Inter and JetBrains Mono are served from this site under the
SIL Open Font License (`fonts/*/OFL.txt`), so the pages make no requests to
Google Fonts. There is no third-party JavaScript apart from Google Analytics.
