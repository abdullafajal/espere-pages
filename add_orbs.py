import glob
import os

html_files = [
    '/Users/aqib/work/expence_tracker/espere-pages/faq.html',
    '/Users/aqib/work/expence_tracker/espere-pages/privacy.html',
    '/Users/aqib/work/expence_tracker/espere-pages/terms.html',
    '/Users/aqib/work/expence_tracker/espere-pages/about.html',
    '/Users/aqib/work/expence_tracker/espere-pages/contact.html',
]

orb_html = '          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand/15 rounded-full blur-[120px] -z-10 pointer-events-none"></div>\n'

for file in html_files:
    if not os.path.exists(file):
        continue
    with open(file, 'r') as f:
        html = f.read()

    # We look for the main section.
    # Typically <section className="pt-32... min-h-screen">
    
    if '<section className="pt-32 pb-24 px-6 min-h-screen relative overflow-hidden">' not in html:
        # replace the section tag to add relative overflow-hidden
        html = html.replace('<section className="pt-32 pb-24 px-6 min-h-screen">', '<section className="pt-32 pb-24 px-6 min-h-screen relative overflow-hidden">')
        html = html.replace('<section className="pt-32 pb-24 px-6 min-h-screen flex flex-col md:flex-row gap-12">', '<section className="pt-32 pb-24 px-6 min-h-screen flex flex-col md:flex-row gap-12 relative overflow-hidden">')
    
    if 'bg-brand/15 rounded-full blur-[120px] -z-10' not in html:
        # insert the orb right after the section tag
        if '<section className="pt-32 pb-24 px-6 min-h-screen relative overflow-hidden">\n' in html:
            html = html.replace(
                '<section className="pt-32 pb-24 px-6 min-h-screen relative overflow-hidden">\n',
                '<section className="pt-32 pb-24 px-6 min-h-screen relative overflow-hidden">\n' + orb_html
            )
        elif '<section className="pt-32 pb-24 px-6 min-h-screen flex flex-col md:flex-row gap-12 relative overflow-hidden">\n' in html:
            html = html.replace(
                '<section className="pt-32 pb-24 px-6 min-h-screen flex flex-col md:flex-row gap-12 relative overflow-hidden">\n',
                '<section className="pt-32 pb-24 px-6 min-h-screen flex flex-col md:flex-row gap-12 relative overflow-hidden">\n' + orb_html
            )

    with open(file, 'w') as f:
        f.write(html)

print("Updated all files with background orb.")
