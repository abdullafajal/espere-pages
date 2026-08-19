import glob
import re

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    with open(file, 'r') as f:
        html = f.read()

    # check if theme-color is already present
    if '<meta name="theme-color"' not in html:
        # insert after viewport meta tag
        viewport_tag = '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
        theme_color_tag = viewport_tag + '\n  <meta name="theme-color" content="#F5F5F5">'
        html = html.replace(viewport_tag, theme_color_tag)
        
        with open(file, 'w') as f:
            f.write(html)

print("Theme color meta tag added to all HTML files.")
