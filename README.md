# ppdung.github.io

Personal portfolio of **Phạm Phước Dũng** (Pham Phuoc Dung, "Danny"), a
C++/Qt developer working on cross-platform point-of-sale, kitchen display and
kiosk software.

**Live:** <https://ppdung.github.io> · **Tiếng Việt:** <https://ppdung.github.io/vi/>

A static single-page site, hand-written, with no build step. The English and
Vietnamese versions are separate pages, so each one is indexed on its own and
paired with the other through `hreflang`.

## Layout

```
index.html            English page: content, meta tags, JSON-LD
vi/index.html         Vietnamese page: the same structure, translated
404.html              Not-found page (root-absolute paths; styles in css/404.css)
css/
  style.css           The theme. Hand-edited; this is the source of truth.
  fonts.css           Inter + JetBrains Mono @font-face rules (also used by 404.html)
  404.css             The not-found page's own styles (a file, so its CSP needs no inline CSS)
  icons.css           Subsetted icomoon + devicon glyph definitions
  bootstrap.css       Vendored Bootstrap 3.3.5, trimmed to the rules the pages use
js/
  site.js             All page behaviour, shared by both languages. No libraries.
fonts/
  inter/              Inter v20, variable woff2 per subset (latin, latin-ext, vietnamese)
  jetbrains-mono/     JetBrains Mono v24, the same three subsets
  icomoon/            21 glyphs, subsetted from the full icomoon set
  devicon/            17 glyphs, subsetted from devicon
images/
  avatar.*            Sidebar portrait (WebP + JPEG)
  about.jpg           Full portrait, used as the JSON-LD Person image
  og-cover.jpg        1200x630 social preview card (og:image / twitter:image)
  deepkds.*, deepdid.*, master-graduation.*   Project and education photos
  favicon.ico         The icon the pages link to (16, 32 and 48 px)
favicon.ico           Copy of images/favicon.ico for clients that ask for /favicon.ico
apple-touch-icon.png  180x180 home-screen icon
site.webmanifest      Name, icons and the #0d1117 theme colour
sitemap.xml           Both pages (with hreflang alternates) and the CV
robots.txt
CV_PhamPhuocDung.pdf  The CV linked from both pages
.github/workflows/gitleaks.yml   Secret scan on every push and pull request
.gitleaksignore       Known, already-revoked findings the scan may skip
```

## Editing the two languages

`index.html` and `vi/index.html` are independent files with the same
structure. Every change to one needs the same change in the other, in natural
wording for that language.

- **Content.** Sections, ids, classes and `data-*` hooks are identical in both
  files; only the text differs. Section ids (`about`, `experience`,
  `projects`, `tech-stack`, `education`, `contact`) are part of the URLs
  people share, so keep them the same in both.
- **Paths.** The EN page uses `css/...`, `images/...`; the VI page, one folder
  down, uses `../css/...`, `../images/...`. Absolute `https://ppdung.github.io/`
  URLs (canonical, hreflang, og:image, JSON-LD) are the same in both.
- **Head.** Title, meta description, Open Graph and Twitter tags, and
  `og:image:alt` are translated per page. Both pages use the same
  `images/og-cover.jpg`.
- **Structured data.** Both pages describe the same person
  (`"@id": "https://ppdung.github.io/#person"`). Keep the facts identical
  (`alternateName`, `sameAs`, employer, school, skills); only `name`,
  `jobTitle`, `description` and `seeks.name` are written in the page's
  language, matching what that page shows.
- **Script text.** The only language-specific strings in `js/site.js` are in
  the `STRINGS` table at the top, keyed by `<html lang>`.
- **Dates.** When the content changes, update all three together: the
  "Last updated" line at the foot of Contact, `dateModified` in the
  `ProfilePage` JSON-LD of both pages, and `<lastmod>` in `sitemap.xml`. A
  date nobody maintains is worse than none.

## Notes for anyone editing this

- **`css/style.css` is the source of truth.** It is hand-edited. The original
  template's Sass sources were deleted because they had diverged completely and
  rebuilding from them would have wiped the current design.
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
- **Behaviour lives in `js/site.js`, once, for both pages.** Each feature
  starts inside its own try/catch, so one failing cannot stop the others.
- **Reveal-on-scroll never hides content by itself.** `js/site.js` hides only
  boxes it has measured to be below the fold, so if the script does not load,
  everything is simply visible.
- **The social card** (`images/og-cover.jpg`) is an HTML page rendered in
  headless Chrome at 1200x630 and saved as JPEG at quality 85 (about 80 KB).
  It shows the portrait, name, title and one line already on the page. Keep
  everything important inside the central 1200x600 area, which X crops to.
  After replacing it, ask LinkedIn's Post Inspector and Facebook's Sharing
  Debugger to re-fetch the page, or old shares keep the cached image.
- **The CV's document properties are set after export.** Canva writes the file
  name as the PDF Title, its account name as the Author, and its internal
  design ids as Keywords. After each new export, set Title, Author, Subject
  and Keywords again (in both the Info dictionary and the XMP packet, with a
  full rewrite rather than an incremental save) and confirm with
  `pdftotext -enc UTF-8` that the text is unchanged. Use only keywords that
  appear in the CV itself.

## Privacy, analytics and the Content Security Policy

**Google Analytics 4** (`G-0586HR4EGC`) has enhanced measurement on, which
already records page views, scrolls, outbound clicks and file downloads.
`js/site.js` adds only what enhanced measurement cannot see: `cv_download`
(`link_location`), `contact_click` (`method`), `select_content` (project
dialogs and videos), `section_view` (`section_name`), `generate_lead` and
`form_submit_error` for the contact form. Every call goes through `track()`,
which does nothing if the analytics setup did not run.

There is no GA snippet in the HTML. `js/site.js` (`initGtag`) does it all:

- **Consent Mode v2.** `ad_storage`, `ad_user_data` and `ad_personalization`
  are always denied, and Google signals and ad personalisation are off in the
  config. `analytics_storage` is denied until the visitor clicks Allow.
- **Consent notice.** A small card in the bottom corner (`#consent`) asks once.
  The answer is kept in `localStorage` (`analyticsConsent`: `granted` or
  `denied`), so it holds for both languages.
  - Undecided: GA4 sends cookieless pings, so visits are counted but returning
    browsers are not recognised.
  - Allow: the `_ga` cookies are set, for 13 months (`cookie_expires`).
  - Decline: gtag.js is never loaded, the `ga-disable-G-0586HR4EGC` flag is
    set, and any `_ga` cookies are deleted.
- **Late loading.** gtag.js (about 175 KB) loads once the page has loaded and
  gone idle, or on the first tap, key or scroll. Events from before then wait
  in `dataLayer`.
- **The trade-off.** A site this size is far below GA4's thresholds for
  modelling cookieless traffic, so returning-visitor and session figures, and
  most CV-download and lead attribution, will cover only visitors who click
  Allow. Visitors who leave within a second or so of the page loading, without
  touching it, are not counted.
- **Search Console.** If ownership was verified with the Google Analytics
  method, that check needs the tag in `<head>`, which is gone. Switch to the
  HTML-file method (a `google*.html` file at the root) before it lapses.
- **Lab runs.** Lighthouse and local testing send hits from `localhost`. Add a
  hostname filter in GA, or block `*google-analytics.com/g/collect*` while
  testing.

**The privacy note** (`#privacy`, a dialog linked from the consent notice and
from the foot of Contact; `/#privacy` opens it) says what is collected and
where it goes: GA4, Formspree for the contact form, YouTube's privacy-enhanced
embeds, and GitHub Pages' IP logging. It must match what the site does. A new
third-party service, a new analytics event that collects something new, or a
change to the cookies means updating it on both pages.

**Content Security Policy.** GitHub Pages cannot send headers, so each page
carries the policy in a `<meta http-equiv="Content-Security-Policy">` right
after `<meta charset>`. It is the same on `index.html` and `vi/index.html`:

| Directive | Allows | For |
|---|---|---|
| `default-src` | `'self'` | everything not listed (the manifest, for one) |
| `script-src` | `'self'`, `www.googletagmanager.com` | `js/site.js`, gtag.js |
| `style-src` | `'self'` | the stylesheets in `css/` |
| `img-src` | `'self'`, `i.ytimg.com`, `*.google-analytics.com`, `*.googletagmanager.com` | site images, video thumbnails, GA |
| `font-src` | `'self'` | `fonts/` |
| `connect-src` | `formspree.io/f/mdaanwpo`, `*.google-analytics.com`, `*.analytics.google.com`, `*.googletagmanager.com` | the contact form's fetch, GA hits |
| `frame-src` | `www.youtube-nocookie.com` | the project videos |
| `form-action` | `formspree.io/f/mdaanwpo` | the form without JavaScript |
| `base-uri`, `object-src` | `'none'` | |

- **Nothing inline.** No inline `<script>`, `<style>`, `style="..."` attribute
  or `on...=` handler runs. Styling goes in `css/`, behaviour in
  `js/site.js`. Setting `element.style.x` from script is fine; that is not
  inline CSS. The JSON-LD blocks are data, not scripts, and are not affected.
- **Adding something.** Anything new the pages load from another site (an
  image host, a font, an embed, an API) must be added to the policy on both
  pages, or the browser refuses it. A refusal shows in the DevTools console as
  "Refused to ..." or "violates the following Content Security Policy
  directive".
- **Limits.** A meta policy cannot set `frame-ancestors` or violation
  reporting. The allowed hosts (Google Tag Manager above all) stay fully
  trusted. The pages have no place where visitor input becomes HTML, so this
  is hardening rather than a fix for a known hole.
- **404.html** has its own, stricter policy (its own styles, fonts and icon
  only), which is why its CSS is in `css/404.css` rather than inline.

Both pages also send `strict-origin-when-cross-origin` as their referrer
policy, so other sites see only `https://ppdung.github.io` and not the path.

## Running it locally

Any static server; there is nothing to build.

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` straight from the
filesystem shows the styled page, but the EN/VI switch (`vi/`), `./` links and
the root-absolute paths in `404.html` only resolve behind a server.

## Deployment

GitHub Pages builds from `main`, root path, with the default Jekyll step
(which skips dotfiles such as `.github/` and `.gitleaksignore`). Pushing to
`main` deploys. There are no custom HTTP headers.

## Secret scanning

`.github/workflows/gitleaks.yml` runs [gitleaks](https://github.com/gitleaks/gitleaks)
over the whole history on every push and pull request and fails the check if
it finds a credential. To check before committing:

```sh
gitleaks git --pre-commit --staged --redact   # staged changes only
gitleaks git --redact .                        # the whole history
```

History is not rewritten. A finding that is already revoked can be listed by
its fingerprint in `.gitleaksignore`, with a comment saying why.

## Third-party

Bootstrap's CSS and the fonts are vendored and marked `linguist-vendored` in
`.gitattributes`. Inter and JetBrains Mono are served from this site under the
SIL Open Font License (`fonts/*/OFL.txt`), so the pages make no requests to
Google Fonts. There is no third-party JavaScript apart from Google Analytics,
which loads only as described above. The contact form posts to Formspree;
the project videos are YouTube embeds in privacy-enhanced mode
(youtube-nocookie.com).
