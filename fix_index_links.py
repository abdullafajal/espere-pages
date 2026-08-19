import glob
import re

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    with open(file, 'r') as f:
        html = f.read()

    # Change href="index.html" to href="/"
    html = html.replace('href="index.html"', 'href="/"')
    
    # Also change href="index.html#features" to href="/#features"
    html = html.replace('href="index.html#features"', 'href="/#features"')

    with open(file, 'w') as f:
        f.write(html)

print("Changed index.html links to root (/).")
