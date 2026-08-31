# ppdung.github.io

Personal portfolio of **Phạm Phước Dũng** — C++/Qt developer working on
cross-platform point-of-sale, kitchen display and kiosk software.

**Live:** <https://ppdung.github.io> · **Tiếng Việt:** <https://ppdung.github.io/vi/>

A static single-page site, hand-written, no build step. Two language versions
are served as separate pages so each is indexable on its own.

## Layout

```
index.html          English site — content, structured data, all page behaviour
vi/index.html       Vietnamese site — separate URL, paired via hreflang
404.html            Not-found page
css/
  style.css         The theme. Hand-edited; this is the source of truth.
  icons.css         Subsetted icomoon + devicon glyph definitions
  bootstrap.css     Vendored: grid, collapse and panel only
js/
  main.js           Reveal-on-scroll, nav, off-canvas menu
  jquery.min.js     Vendored, required by Bootstrap's collapse
  bootstrap.min.js  Vendored
  jquery.waypoints.min.js  Vendored, drives nav section highlighting
fonts/
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
- **Content is hidden until revealed on scroll**, gated behind a `js-reveal`
  class set by a script in `<head>`. A failsafe drops that class after three
  seconds if `js/main.js` has not loaded, so a broken script cannot leave the
  page blank.

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

Bootstrap, jQuery and the icon fonts are vendored and marked
`linguist-vendored` in `.gitattributes`. Inter and JetBrains Mono are loaded
from Google Fonts. Typed.js comes from cdnjs.
