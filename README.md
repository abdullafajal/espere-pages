# espere-pages

Marketing and support website for [Espere](https://espere.in), served by GitHub Pages
(`.github/workflows/static.yml` publishes the repository root on every push to `main`).

Plain HTML, one stylesheet and one small script. No framework, no bundler, no runtime
dependencies.

## Structure

```
index.html about.html faq.html contact.html privacy.html terms.html 404.html   <- built pages (committed)
assets/css/styles.css   design system: tokens, components, motion, responsive rules
assets/js/main.js       scroll reveal, counters, parallax, menu, accordion/FAQ, contact form
src/layout*.html        page shells
src/partials/           head, header, footer, icon sprite (shared by every page)
src/pages/*.html        page content with a small front-matter block
build.py                assembles src/ into the root pages (Python 3, standard library only)
images/                 logo, favicon, Open Graph image
espere.apk              latest Android build
.well-known/            Android app-link verification
```

## Editing

1. Edit files in `src/` (content/partials) or `assets/` (styles/script).
2. Run `python3 build.py` to regenerate the root `*.html` pages.
3. Preview with any static server, e.g. `python3 -m http.server`, and commit the generated pages.

Never edit the root `*.html` files by hand: they are overwritten by the build.

## Notes

* `404.html` doubles as the invite / friend-link landing page. GitHub Pages serves it for
  unknown paths such as `/invite/<token>`, `/add_friend/<user>` and `/accounts/register/`,
  so it uses absolute asset URLs and keeps its small inline script.
* The contact form talks to `https://montra.pythonanywhere.com/api/contact/` (captcha + submit).
* Motion respects `prefers-reduced-motion`; add `#noanim` to a URL to disable reveals while testing.

## SEO & performance

`python3 build.py` also takes care of these (nothing to install):

- **Structured data**: JSON-LD (Organization, WebSite, WebPage, BreadcrumbList; the home page also describes the app as a free Android `MobileApplication`). The FAQ keeps its own `FAQPage` block.
- **`sitemap.xml`** is generated from the pages in `src/pages` (the 404/invite page is `noindex` and left out). `lastmod` is the date of the page's last git commit.
- **`robots.txt`** and **`llms.txt` / `llms-full.txt`** are hand-written in the repository root. Update `llms-full.txt` when the FAQ or feature list changes.
- **Inlined CSS**: the minified stylesheet is written into every page (one round trip less before the first paint). Edit `assets/css/styles.css`, never the built pages.
- **Headline words are pre-split** at build time and the hero animates with CSS only, so the first paint already contains the headline and nothing shifts when JavaScript runs.
- **Self-hosted fonts** in `assets/fonts/` (about 65 KB): Bricolage Grotesque (display cut) and Inter, subset to the characters the site uses plus the rupee sign. If you add a character that is not in them (for example a new symbol) it falls back to the system font; to regenerate, request the families from Google Fonts with `&text=` listing every character used and replace the two files.
- **Analytics** (Microsoft Clarity) loads after the page is interactive (first touch or 4 s after load), so it never delays rendering.
