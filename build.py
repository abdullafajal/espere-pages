#!/usr/bin/env python3
"""Static site builder for espere.in (GitHub Pages).

Pages live in src/pages/*.html as an HTML fragment with a small front-matter
block. Shared parts (head, header, footer, icon sprite) live in src/partials.
Run `python3 build.py` after editing anything in src/; it writes the finished
pages to the repository root. No dependencies, Python 3 standard library only.

Front-matter keys:  title, description, path, nav, body_class, layout, base,
                    theme_color, header_tone, robots, extra_head
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
DEFAULTS = {
    "layout": "layout",
    "base": "",
    "nav": "",
    "body_class": "",
    "theme_color": "#F4F3EC",
    "header_tone": "light",
    "robots": "index, follow",
    "extra_head": "",
    "description": "Master your money with Espere. The ultimate app to track personal spending with precision, set smart budgets, and instantly split group expenses with friends.",
}


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


def main():
    partials = {p.stem: read(p) for p in (SRC / "partials").glob("*.html")}
    built = []
    for page in sorted((SRC / "pages").glob("*.html")):
        meta, content = parse_page(read(page))
        meta["content"] = content
        html = render(read(SRC / f"{meta['layout']}.html"), meta, partials)
        html = mark_current(html, meta["nav"])
        # Absolute (base="/") pages keep asset links absolute, e.g. the 404 page.
        if meta["base"]:
            html = re.sub(r'(href|src)="(images/)', r'\1="%s\2' % meta["base"], html)
            html = re.sub(r'(href)="(index\.html)', r'\1="%s\2' % meta["base"], html)
        out = ROOT / page.name
        out.write_text(html + "\n", encoding="utf-8")
        built.append(page.name)
    print("Built:", ", ".join(built))


if __name__ == "__main__":
    sys.exit(main())
