import glob

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

old_str = '<div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>'
new_str = '<a href="index.html" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">'

old_end_str = '            </div>\n            \n            <div className="hidden md:flex'
new_end_str = '            </a>\n            \n            <div className="hidden md:flex'

for file in html_files:
    with open(file, 'r') as f:
        html = f.read()

    # We need to replace the opening tag
    html = html.replace(old_str, new_str)
    
    # We need to replace the closing </div> with </a> for the logo container
    # Since it's exactly before the nav links div, we can use that as a marker
    html = html.replace(
        '            </div>\n            \n            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-dark/80 bg-white px-8 py-3 rounded-pill shadow-card border border-black/5">',
        '            </a>\n            \n            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-dark/80 bg-white px-8 py-3 rounded-pill shadow-card border border-black/5">'
    )

    with open(file, 'w') as f:
        f.write(html)

print("Navbar logo updated to Home link in all HTML files.")
