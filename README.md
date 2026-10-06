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
  print.css           Print and Save as PDF: the page as a short CV (media="print")
  fonts.css           Inter + JetBrains Mono @font-face rules (also used by 404.html)
  404.css             The not-found page's own styles (a file, so its CSP needs no inline CSS)
  noscript.css        Loaded only with JavaScript off (<noscript> in each head): the master's-panel photo
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
  yt-<video id>.*     Posters for the four project videos (WebP + JPEG)
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
wording for that language. That includes the print-only blocks (see "Print
and Save as PDF" below).

- **Content.** Sections, ids, classes and `data-*` hooks are identical in both
  files; only the text differs. Section ids (`about`, `experience`,
  `projects`, `tech-stack`, `education`, `contact`) and project dialog keys
  (`#project-deepkds` and so on, see "Project dialogs" below) are part of
  the URLs people share, so keep them the same in both.
- **Paths.** The EN page uses `css/...`, `images/...`; the VI page, one folder
  down, uses `../css/...`, `../images/...`. Absolute `https://ppdung.github.io/`
  URLs (canonical, hreflang, og:image, JSON-LD) are the same in both.
- **Head.** Title, meta description, Open Graph and Twitter tags, and
  `og:image:alt` are translated per page. Both pages use the same
  `images/og-cover.jpg`.
- **Structured data.** Both pages describe the same person
  (`"@id": "https://ppdung.github.io/#person"`). Keep the facts identical
  (`alternateName`, `sameAs`, employer, school, skills, `award`); only
  `name`, `givenName`, `additionalName`, `familyName` (ASCII on `/`, with
  diacritics on `/vi/`), `jobTitle`, `description` and `seeks.name` are
  written in the page's language, matching what that page shows.
- **Script text.** The only language-specific strings in `js/site.js` are in
  the `STRINGS` table at the top, keyed by `<html lang>`.
- **Dates.** When the content changes, update all three together: the
  "Last updated" line at the foot of Contact, `dateModified` in the
  `ProfilePage` JSON-LD of both pages, and `<lastmod>` of the two page
  `<url>` entries in `sitemap.xml`. The CV's own entry there follows the CV,
  not the pages (see the CV bullet below). A date nobody maintains is worse
  than none.

## What the pages claim, and the sources

Every claim has to be backed by the page itself, the CV PDF or the owner's
decisions. These are worded the same way everywhere they appear (visible
text, dialogs, meta descriptions, the social card and its alt text,
JSON-LD), in both languages:

- **DeepKDS** is "the second-generation DeepKDS" ("DeepKDS thế hệ thứ hai"),
  which he architected and built from an empty repository from Feb 2025 and
  which is the version now running at the DeepKDS brands. The 5,000+ stores,
  85% / 92% and the brand list belong to the whole DeepKDS line, as published
  by SMARTCAST; never present them as the result of his build alone. Sources
  linked: deeppos.io and a NewsImpact article of 11 Sep 2026 (Korean press
  reporting SMARTCAST's announcement, so not an independent check; it names
  Lotteria and Hollys).
- **OrderEAT / SMARTCAST** starts in Mar 2023 ("03/2023"). The CV PDF still
  says May 2023 until its next export.
- **QVIC 2022:** his title is Team Leader. The shortlisted entry was VAS
  Corporation's company entry, listed by Qualcomm as "Platform for next-gen
  logistics for Industry 4.0", under which he led and pitched the indoor
  mobile robot with an arm. Qualcomm's QVIC 2022 page (linked from the
  timeline and the dialog) shows his name on the shortlist image; that
  image also prints a title the CV does not use, so the site never adds one.
  The QVIC video is his finale pitch on stage, not a robot demo.
- **Degrees:** EN "Bachelor of Engineering"; VI "Kỹ sư" (the thesis cover
  reads "KỸ SƯ NGÀNH KỸ THUẬT ĐIỀU KHIỂN & TỰ ĐỘNG HÓA"), never "Cử nhân".
  The master's thesis links its HCMUT library record (OPAC `ID=32322`).
- **Employer:** headings keep the public brand "SMARTCAST Korea"; the
  registered name ㈜스마트캐스트 and the head office in Goyang, Gyeonggi-do
  (Seoul Capital Area) are what the locations, About and `worksFor` state.
- **Smart Pharmacy (2024)** was a freelance project for an unnamed client,
  not SMARTCAST work. It is labelled as freelance on its card and in its
  dialog eyebrow ("Freelance project", "Dự án tự do") and on its Tech Stack
  line, it is not in the SMARTCAST timeline entries, and its card follows
  the SMARTCAST cards. Describe it on its own terms; its architecture
  reflects his kiosk design experience (a state machine and a pluggable
  payment layer). Facts: 20 states, 565 files, ~121,000 lines, four PG
  vendors plus KOCES, eight VANs, three languages, the cash unit, Windows
  and Android. The CV PDF still lists this work as an "Externally, ..."
  line inside its SMARTCAST section; the next export should give it an
  entry of its own.
- **Name:** "Danny" (from the CV header) is shown under the name: on `/`
  with a note of which part is the family name ("family name: Pham"), on
  `/vi/` as "Tên tiếng Anh: Danny".
- **Hero role line:** the heading's text is a one-line description; the
  rotating roles are in the `data-roles` attribute of `.hero-typed`, not a
  hidden list, which text extractors read as job titles he has held.

The external records (Qualcomm, HCMUT library, NewsImpact, deeppos.io,
Google Play) are linked as they were on 2026-10-06; check they still answer
before relying on them.

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
  `Inter Fallback` and `JetBrains Mono Fallback` metrics in the same file:
  local system fonts scaled to about the same letter width, so most text
  wraps the same before and after the real font arrives. Not all: on the
  English page the fallback is about 2% narrower than Inter, so a line that
  ends near the edge can re-wrap when Inter comes in. The hero tagline, the
  largest text on the first screen, is balanced from 769px
  (`text-wrap: balance`), which makes it break at the same words with either
  face. On phones it is not balanced (there, balancing made the layout
  shift worse at 412, 430 and 768px), so some phone widths still re-wrap it
  when Inter arrives, as before. Check a change to the tagline with fonts
  held back, at desktop and phone widths, in both languages.
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
- **Project dialogs.** Each `<div class="project-modal" id="modal-<key>">`
  opens from the card button with `data-project-modal="<key>"` and has the
  address `#project-<key>`: `/#project-deepkds` and `/vi/#project-deepkds`
  open the DeepKDS dialog, so a single project can be sent to someone.
  `js/site.js` (`initDialogs`) does the rest:
  - Opening one from its button adds a history entry, so Back (a phone's
    back gesture too) closes it rather than leaving the site; the close
    button, the backdrop and Escape step back over that entry, so no stale
    address is left. A dialog opened from a link gets its entry on the
    visitor's first tap, click or key (Chrome skips, on Back, entries a page
    added before anyone touched it); until then it closes in place. The
    privacy note (`#privacy`) adds no entry.
  - Previous and Next buttons go through the projects in the order of the
    card buttons, wrapping round, and replace the entry, so one Back still
    closes the dialog. The dialog also carries a copy of the language switch,
    which opens the same dialog on the other page; the sidebar's switch keeps
    the `#project-` address too. Closing returns focus to the card of the
    project last shown.
  - While a dialog is open the rest of the page is `inert`, and Tab and
    Shift+Tab step through the dialog's own controls and wrap (handled in
    script, so it holds in Safari, whose default Tab skips links). Focus
    starts on the dialog's title (`tabindex="-1"`, never drawn with a ring),
    and the arrow keys, Page Up/Down, Space, Home and End pressed there
    scroll the text. The text, `.project-modal__body`, is a named region
    with `tabindex="0"` and the next stop for Tab, where it shows the
    keyboard ring. Focus used to start on the text itself, and on a cold
    `/#project-` link that drew the ring round the whole text. Closing
    fades out over 160 ms, or at once under reduced motion.
  - A new project needs only the card button and the dialog markup, in both
    files. In a lab run, opening, switching and closing dialogs sent GA4 no
    extra `page_view` (the address changes only in its fragment).
- **Project videos.** Each is a `<button class="yt-facade" data-yt-id="...">`
  with a poster and the name "Play video: <title>"; `initVideos` replaces it
  with the `youtube-nocookie.com` player, playing, on a click, so nothing is
  requested from YouTube before then. The posters are YouTube's
  `hqdefault.jpg` for each video, cropped from 480x360 to the 480x270 picture
  inside its letterbox bars and saved as WebP and JPEG without metadata. A
  "Watch on YouTube" link beside each card works without JavaScript, and in
  in-app browsers that block embeds. Leave `enablejsapi` off the embed URL:
  with it, GA4 loads YouTube's iframe API and counts each play twice.
- **The social card** (`images/og-cover.jpg`) is an HTML page rendered in
  headless Chrome at 1200x630 and saved as JPEG at quality 85 (about 80 KB).
  It shows the portrait, name, title and one line that follows the hero
  tagline; `og:image:alt` and `twitter:image:alt` on both pages quote that
  line, so the three change together. Keep everything important inside the
  central 1200x600 area, which X crops to. After replacing it, ask
  LinkedIn's Post Inspector and Facebook's Sharing Debugger to re-fetch the
  page, or old shares keep the cached image.
- **The CV links.** Each "Download CV" link has the `download` attribute;
  "View CV in browser" (hero) and "View in browser" (Contact) have none and
  open the PDF in a new tab, in the browser's own viewer. In the hero it is
  a one-line text link centred under the two buttons at every width (it
  never wraps); beside them, from 769px, it had only the grid's narrow outer
  column and broke onto two or three lines.
- **Print and Save as PDF.** Recruiters print the page or save it as a PDF
  to attach to an applicant record. `css/print.css`, linked with
  `media="print"` so a visit never waits for it, holds every print rule and
  turns the page into a short CV:
  - On paper: a header (name, "Danny", the heading's role line and a
    contact line), About with its focus areas as one line, Experience with
    every bullet (the folded ones too), each project's title and summary,
    Tech Stack as one line of keywords per group, Education, Languages, and
    a footer line pointing to the site, its case studies and the CV PDF,
    above "Last updated".
  - Off paper: the sidebar, the hero's decoration, typing line, tagline,
    links, availability line and buttons, the consent notice, videos and
    photos, the project stats, notes, links and tags, the timeline glyphs,
    the skill cards, the contact form and the dialogs.
  - Three blocks exist only on paper. They carry the `hidden` attribute, so
    they never show on screen or to screen readers: `.print-contact` (in the
    hero), `.print-languages` (between Education and Contact) and
    `.print-footer` (above "Last updated"), in both files. They repeat the
    email, phone, LinkedIn, IELTS/TOEIC and CV address, so change them
    with those.
  - Every rule is `!important` inside `@layer print`. Important declarations
    in a cascade layer outrank the theme's unlayered `!important` ones
    whatever their specificity, so a print rule never has to out-specify
    the theme (`#colorlib-hero .hero-name` printed near-white before). The
    text is dark on white with "Background graphics" ticked or not, and
    `color-scheme: light` keeps Chrome from framing each page in black.
  - Links print as their text. An http(s) link in the body adds its address
    in angle brackets; `mailto:`, `tel:` and in-page links add nothing, and
    the header and footer show their addresses as the link text. Links stay
    clickable in a saved PDF.
  - Page breaks: headings, each job's title and project line stay with what
    follows them; a bullet, project, degree or the Tech Stack list is never
    split; nothing keeps a screen height, so no page comes out empty.
  - Measured with Chrome's `Page.printToPDF` (A4 and Letter, the stylesheet's
    14 mm / 15 mm margins, background graphics on and off) on 2026-10-06:
    5 pages for both `/` and `/vi/`, the first job on page 1. Before, it was
    22 pages, page 1 blank and the first job on page 6. After a change,
    check Chrome's print preview at A4 and Letter for both pages, with and
    without background graphics; a new screen element that should not
    print needs a line in the "Off paper" list of `css/print.css`.
- **The menu button** draws its bars as SVG strokes in `currentColor`. Bars
  painted as backgrounds nearly vanished when a browser forced its own dark
  mode over this already dark page (Chromium's force-dark, behind Samsung
  Internet's dark mode) and disappeared in Windows high-contrast mode.
- **The CV's document properties are set after export.** Canva writes the file
  name as the PDF Title, its account name as the Author, and its internal
  design ids as Keywords. After each new export, set Title, Author, Subject
  and Keywords again (in both the Info dictionary and the XMP packet, with a
  full rewrite rather than an incremental save) and confirm with
  `pdftotext -enc UTF-8` that the text is unchanged. Use only keywords that
  appear in the CV itself. Then set the CV's `<lastmod>` in `sitemap.xml` to
  the export date; a page edit alone does not change it.

## Privacy, analytics and the Content Security Policy

**Google Analytics 4** (`G-0586HR4EGC`) has enhanced measurement on, which
already records page views, scrolls, outbound clicks and file downloads.
`js/site.js` adds only what enhanced measurement cannot see: `cv_download`
and `cv_view` (`link_location`; GA's own `file_download` counts both, since
both links end in `.pdf`), `contact_click` (`method`), `select_content` (a
project dialog opened from its button, from a link or with Previous / Next,
and a video's play button), `section_view` (`section_name`), `generate_lead` and
`form_submit_error` for the contact form. Every call goes through `track()`,
which does nothing if the analytics setup did not run.

There is no GA snippet in the HTML. `js/site.js` (`initGtag`) does it all:

- **Consent Mode v2.** `ad_storage`, `ad_user_data` and `ad_personalization`
  are always denied, and Google signals and ad personalisation are off in the
  config. `analytics_storage` is denied until the visitor clicks Allow.
- **Consent notice.** One short line with Allow, Decline and a link to the
  privacy note (`#consent`) asks once: a strip in the bottom-right corner
  from 769px, a bar along the bottom on phones. It is kept low enough to
  stay below the hero's Download CV and Contact Me buttons at 390x844,
  820x1180, 1366x657 and 1440x900, in both languages; recheck that if its
  text or the hero's gets longer. From 769px the "View CV in browser" link
  and the tech icons clear it too on screens 657px tall or more (checked
  at 992x700, 1024x768, 1280x680, 1280x720, 1366x657, 1440x700 and
  1536x730): the hero's gaps shrink on screens 780px tall or less, and at
  700px or less the content sits 16px above the middle. On a 1024x600
  netbook the strip still covers part of the icons (and, in Vietnamese,
  of the link) until a choice is made. On short phones the hero is taller than
  the screen, and a short-screen rule in `css/style.css` tightens its gaps:
  at 375x667 the buttons clear the bar in English (10px of Liên hệ is
  covered in Vietnamese), but at 320x640 the bar still covers Contact Me
  (and most of Tải CV) until a choice is made. After a choice, keyboard
  focus moves to the heading of the section being read, not to `<body>`.
  The answer is kept in `localStorage` (`analyticsConsent`: `granted` or
  `denied`), so it holds for both languages.
  - Undecided: GA4 sends cookieless pings, so visits are counted but returning
    browsers are not recognised.
  - Allow: the `_ga` cookies are set, for 13 months (`cookie_expires`).
  - Decline: gtag.js is not loaded if it has not been already, the
    `ga-disable-G-0586HR4EGC` flag is set so nothing recorded after declining
    is sent (an event GA had already queued may still go out once, without
    cookies), and any `_ga` cookies are deleted.
- **Late loading.** gtag.js (about 175 KB) loads on the first tap, key or
  scroll, or four seconds after the page has loaded, whichever comes first.
  Its start-up is three long tasks on a mid-range phone; loaded as soon as the
  page went idle, they fell in the first seconds of reading and counted
  against Total Blocking Time. Events from before then wait in `dataLayer`.
- **The trade-off.** A site this size is far below GA4's thresholds for
  modelling cookieless traffic, so returning-visitor and session figures, and
  most CV-download and lead attribution, will cover only visitors who click
  Allow. Visitors who leave within about four seconds of the page loading,
  without tapping, typing or scrolling, are not counted.
- **Search Console.** If ownership was verified with the Google Analytics
  method, that check needs the tag in `<head>`, which is gone. Switch to the
  HTML-file method (a `google*.html` file at the root) before it lapses.
- **Lab runs.** Lighthouse and local testing send hits from `localhost`. Add a
  hostname filter in GA. Blocking `*/g/collect*` while testing works, but a
  blocked hit makes gtag retry through `www.google.com/g/collect`, which the
  policy below refuses, so the console shows a CSP error that a real visit
  does not. Answering the hits locally (DevTools request overrides, or CDP
  `Fetch` with a 204) avoids both. A Lighthouse run ends about when gtag.js
  arrives, four seconds after load, before it has sent anything.

**The privacy note** (`#privacy`, a dialog linked from the consent notice and
from the foot of Contact; `/#privacy` opens it) says what is collected and
where it goes: GA4, Formspree for the contact form, YouTube's privacy-enhanced
player once a video is played, and GitHub Pages' IP logging. It must match
what the site does. A new third-party service, a new analytics event that
collects something new, or a change to the cookies means updating it on both
pages.

**Content Security Policy.** GitHub Pages cannot send headers, so each page
carries the policy in a `<meta http-equiv="Content-Security-Policy">` right
after `<meta charset>`. It is the same on `index.html` and `vi/index.html`:

| Directive | Allows | For |
|---|---|---|
| `default-src` | `'self'` | everything not listed (the manifest, for one) |
| `script-src` | `'self'`, `www.googletagmanager.com` | `js/site.js`, gtag.js |
| `style-src` | `'self'` | the stylesheets in `css/` |
| `img-src` | `'self'`, `*.google-analytics.com`, `*.googletagmanager.com` | site images (the video posters among them), GA |
| `font-src` | `'self'` | `fonts/` |
| `connect-src` | `'self'`, `formspree.io/f/mdaanwpo`, `*.google-analytics.com`, `*.analytics.google.com`, `*.googletagmanager.com` | `/robots.txt` as Lighthouse and PageSpeed Insights fetch it from the page (without `'self'` their SEO audit fails, 92 instead of 100; crawlers are not affected), the contact form's fetch, GA hits |
| `frame-src` | `www.youtube-nocookie.com` | a project video, once its play button is pressed |
| `form-action` | `formspree.io/f/mdaanwpo` | the form without JavaScript |
| `base-uri`, `object-src` | `'none'` | |

- **Nothing inline.** No inline `<script>`, `<style>`, `style="..."` attribute
  or `on...=` handler runs, `<noscript>` included (it links
  `css/noscript.css` instead). Styling goes in `css/`, behaviour in
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
the project videos are YouTube's privacy-enhanced player
(youtube-nocookie.com), loaded only when a play button is pressed.
