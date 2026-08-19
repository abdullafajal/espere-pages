import os
import glob

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

old_btn = '''<button className="bg-brand hover:bg-brand-hover text-dark font-bold px-7 py-3 rounded-btn transition-all duration-300 hover:shadow-glow transform hover:-translate-y-0.5">
                Get the App
              </button>'''

new_btn = '''<a href="espere.apk" download className="inline-block bg-brand hover:bg-brand-hover text-dark font-bold px-7 py-3 rounded-btn transition-all duration-300 hover:shadow-glow transform hover:-translate-y-0.5">
                Download App
              </a>'''

for file in html_files:
    if "index.html" in file:
        continue # we already did index.html using multi_replace_file_content
    with open(file, 'r') as f:
        html = f.read()

    html = html.replace(old_btn, new_btn)

    with open(file, 'w') as f:
        f.write(html)

print("Navbar buttons fixed in all HTML files.")
