#!/usr/bin/env python3
"""Static site builder for espere.in (GitHub Pages).

Pages live in src/pages/*.html as an HTML fragment with a small front-matter
block. Shared parts (head, header, footer, icon sprite) live in src/partials.
Run `python3 build.py` after editing anything in src/ or assets/css/styles.css;
it writes the finished pages to the repository root. No dependencies, Python 3
standard library only.

What the build does besides templating:
  * pre-splits headline words (data-split) so the layout never shifts after JS runs
  * turns data-delay="N" into an inline --d custom property (CSS-only hero animation)
  * writes JSON-LD structured data (Organization, WebSite, WebPage, Breadcrumb, App)
  * writes sitemap.xml (lastmod comes from git)
  * inlines a minified copy of assets/css/styles.css into every page

Front-matter keys:  title, description, path, nav, body_class, layout, base,
                    theme_color, header_tone, robots, extra_head
"""
import datetime
import html as htmllib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
SITE = "https://espere.in/"
INDEXABLE = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
DEFAULTS = {
    "layout": "layout",
    "base": "",
    "nav": "",
    "body_class": "",
    "theme_color": "#F4F3EC",
    "header_tone": "light",
    "robots": INDEXABLE,
    "extra_head": "",
    "jsonld": "",
    "description": "Espere is a free, open-source expense tracker for Android. Track spending, set budgets and split group bills with friends, even offline.",
}
CRUMBS = {"about.html": "About", "contact.html": "Contact Support", "faq.html": "FAQ", "privacy.html": "Privacy Policy", "terms.html": "Terms of Service"}
PAGE_TYPES = {"about.html": "AboutPage", "contact.html": "ContactPage", "faq.html": "FAQPage"}


def read(path):
    return path.read_text(encoding="utf-8")


def parse_page(text):
    m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S)
    if not m:
        raise ValueError("missing front matter")
    meta = dict(DEFAULTS)
    key = None
    for line in m.group(1).split("\n"):
        if re.match(r"^[a-z_]+:", line):
            key, _, val = line.partition(":")
            meta[key.strip()] = val.strip()
        elif key:  # continuation line (multi-line values such as extra_head)
            meta[key] += "\n" + line
    return meta, m.group(2).strip()


def render(template, ctx, partials):
    def partial(m):
        return render(partials[m.group(1)], ctx, partials)
    out = re.sub(r"\{\{>\s*([a-z_-]+)\s*\}\}", partial, template)
    return re.sub(r"\{\{\s*([a-z_]+)\s*\}\}", lambda m: str(ctx.get(m.group(1), "")), out)


# Privacy / Terms live inside the "Legal" dropdown, so the dropdown button is highlighted too.
NAV_PARENT = {"privacy": "legal", "terms": "legal"}


def mark_current(html, nav):
    if not nav:
        return html
    for key in filter(None, (nav, NAV_PARENT.get(nav))):
        html = re.sub(r'(<(?:a|button) [^>]*data-nav="%s")' % re.escape(key), r'\1 aria-current="page"', html)
    return html


# ---------------------------------------------------------------- layout-shift-free headlines
def presplit(html):
    """Wrap every word of [data-split] headings in the same markup initSplit() builds in the
    browser, so the page is already laid out when the script runs (no layout shift)."""
    def do_heading(m):
        open_tag, inner, close = m.group(1), m.group(2), m.group(3)
        i = [0]

        def words(text):
            out = []
            for part in re.split(r"(\s+)", text):
                if not part:
                    continue
                if part.isspace():
                    out.append(" ")
                else:
                    out.append('<span class="sw"><span style="--w:%d">%s</span></span>' % (i[0], part))
                    i[0] += 1
            return "".join(out)

        # split inner into tags and text; leave <br> and tag markup alone
        pieces = re.split(r"(<[^>]+>)", inner)
        built = "".join(p if p.startswith("<") else words(p) for p in pieces)
        label = htmllib.unescape(re.sub(r"<[^>]+>", "", inner))
        label = re.sub(r"\s+", " ", label).strip()
        open_tag = open_tag[:-1] + ' data-split-done="1" aria-label="%s">' % htmllib.escape(label, quote=True)
        return open_tag + built + close

    return re.sub(r"(<h[1-6][^>]*\bdata-split\b[^>]*>)(.*?)(</h[1-6]>)", do_heading, html, flags=re.S)


def inline_delays(html):
    """data-delay="250" -> style="--d:250ms" so CSS (not JS) can use it."""
    def tag(m):
        t = m.group(0)
        d = re.search(r'data-delay="(\d+)"', t)
        if not d or "--d:" in t:
            return t
        decl = "--d:%sms" % d.group(1)
        if 'style="' in t:
            return t.replace('style="', 'style="%s;' % decl, 1)
        return t[:-1] + ' style="%s">' % decl
    return re.sub(r"<[a-z0-9]+\b[^>]*\bdata-delay=\"\d+\"[^>]*>", tag, html)


# ---------------------------------------------------------------- structured data
def jsonld(meta):
    if "noindex" in meta["robots"]:
        return ""
    path = meta.get("path", "")
    url = SITE + path
    org = {
        "@type": "Organization", "@id": SITE + "#organization", "name": "Espere", "url": SITE,
        "logo": {"@type": "ImageObject", "url": SITE + "images/logo-512.png", "width": 512, "height": 512},
        "sameAs": ["https://github.com/abdullafajal/espere_app", "https://github.com/abdullafajal/espere-pages"],
    }
    site = {
        "@type": "WebSite", "@id": SITE + "#website", "url": SITE, "name": "Espere", "inLanguage": "en",
        "description": DEFAULTS["description"], "publisher": {"@id": SITE + "#organization"},
    }
    page = {
        "@type": PAGE_TYPES.get(path, "WebPage"), "@id": url + "#webpage", "url": url,
        "name": meta["title"], "description": meta["description"], "inLanguage": "en",
        "isPartOf": {"@id": SITE + "#website"}, "about": {"@id": SITE + "#organization"},
        "primaryImageOfPage": {"@type": "ImageObject", "url": SITE + "images/og-image.png"},
    }
    graph = [org, site, page]
    if path:
        name = CRUMBS.get(path, re.sub(r"\s*-\s*Espere$", "", meta["title"]))
        page["breadcrumb"] = {"@id": url + "#breadcrumb"}
        graph.append({
            "@type": "BreadcrumbList", "@id": url + "#breadcrumb",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE},
                {"@type": "ListItem", "position": 2, "name": name, "item": url},
            ],
        })
    else:
        graph.append({
            "@type": "MobileApplication", "@id": SITE + "#app", "name": "Espere",
            "alternateName": "Espere: Expense Tracker & Bill Splitter",
            "description": "Free, open-source Android app to track personal expenses, set budgets and split group bills. Works fully offline and syncs when you are back online.",
            "applicationCategory": "FinanceApplication", "operatingSystem": "Android",
            "url": SITE, "downloadUrl": SITE + "espere.apk", "image": SITE + "images/og-image.png",
            "inLanguage": "en", "isAccessibleForFree": True,
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "INR"},
            "author": {"@id": SITE + "#organization"},
            "featureList": [
                "Track personal income and expenses", "Category budgets with real-time warnings",
                "Split group bills equally, by percentage or by exact amounts",
                "Debt simplification into the fewest payments", "Offline-first with automatic sync",
                "PDF reports and data export", "Open source",
            ],
        })
        page["mainEntity"] = {"@id": SITE + "#app"}
    data = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(",", ":"))
    return '<script type="application/ld+json">%s</script>' % data.replace("</", "<\\/")


# ---------------------------------------------------------------- sitemap
def lastmod(page):
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", "src/pages/" + page.name],
                             cwd=ROOT, capture_output=True, text=True, timeout=10).stdout.strip()
        if out:
            return out
    except Exception:
        pass
    return datetime.date.today().isoformat()


def write_sitemap(entries):
    rows = []
    for loc, mod in entries:
        rows.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n  </url>" % (loc, mod))
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>\n' % "\n".join(rows)
    (ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")


# ---------------------------------------------------------------- css
def minify_css(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{};,])\s*", r"\1", css)
    css = re.sub(r":\s+", ":", css)
    css = css.replace(";}", "}")
    return css.strip() + "\n"


def main():
    partials = {p.stem: read(p) for p in (SRC / "partials").glob("*.html")}
    built, sitemap = [], []
    # The stylesheet is inlined into every page: one round trip less before the first paint.
    css = minify_css(read(ROOT / "assets/css/styles.css"))
    inline_css = css.replace('url("../fonts/', 'url("/assets/fonts/').replace("url(../fonts/", "url(/assets/fonts/")
    for page in sorted((SRC / "pages").glob("*.html")):
        meta, content = parse_page(read(page))
        meta["content"] = content
        meta["css"] = inline_css
        if not meta["jsonld"]:
            meta["jsonld"] = jsonld(meta)
        html = render(read(SRC / f"{meta['layout']}.html"), meta, partials)
        html = mark_current(html, meta["nav"])
        html = presplit(html)
        html = inline_delays(html)
        # Absolute (base="/") pages keep asset links absolute, e.g. the 404 page.
        if meta["base"]:
            html = re.sub(r'(href|src)="(images/)', r'\1="%s\2' % meta["base"], html)
            html = re.sub(r'(href)="(index\.html)', r'\1="%s\2' % meta["base"], html)
        out = ROOT / page.name
        out.write_text(html + "\n", encoding="utf-8")
        built.append(page.name)
        if "noindex" not in meta["robots"]:
            sitemap.append((SITE + meta["path"], lastmod(page)))
    write_sitemap(sorted(sitemap, key=lambda e: (e[0] != SITE, e[0])))
    print("Built:", ", ".join(built), "+ sitemap.xml (CSS inlined: %d KB)" % (len(inline_css) // 1024))


if __name__ == "__main__":
    sys.exit(main())
