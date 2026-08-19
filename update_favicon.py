import os
import glob

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    with open(file, 'r') as f:
        html = f.read()

    html = html.replace('<link rel="icon" type="image/png" href="images/logo.png">', '<link rel="icon" type="image/png" href="images/favicon_transparent.png">')

    with open(file, 'w') as f:
        f.write(html)

print("Favicon HTML links updated.")
