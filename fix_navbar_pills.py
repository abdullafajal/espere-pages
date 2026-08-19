import glob
import os

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    filename = os.path.basename(file)
    with open(file, 'r') as f:
        html = f.read()

    # The old div string
    old_div = '<div className="hidden md:flex items-center gap-8 text-sm font-bold text-dark/80 bg-white px-8 py-3 rounded-pill shadow-card border border-black/5">'
    new_div = '<div className="hidden md:flex items-center gap-8 text-[15px] font-bold text-dark/60">'
    
    html = html.replace(old_div, new_div)
    
    # Base links (reset them first in case they were modified)
    # They look like: <a href="#features" className="hover:text-black transition-colors">Features</a>
    html = html.replace('className="hover:text-black transition-colors">Features</a>', 'className="hover:text-dark transition-colors">Features</a>')
    html = html.replace('className="hover:text-black transition-colors">FAQ</a>', 'className="hover:text-dark transition-colors">FAQ</a>')

    # Apply active states
    if filename == 'faq.html':
        html = html.replace('className="hover:text-dark transition-colors">FAQ</a>', 'className="text-dark border-b-2 border-dark pb-1 hover:text-dark transition-colors">FAQ</a>')
    elif filename == 'index.html':
        html = html.replace('className="hover:text-dark transition-colors">Features</a>', 'className="text-dark border-b-2 border-dark pb-1 hover:text-dark transition-colors">Features</a>')

    with open(file, 'w') as f:
        f.write(html)

print("Navbar pills removed and active states added.")
