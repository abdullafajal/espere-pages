import os
import glob

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    with open(file, 'r') as f:
        html = f.read()

    # The block we want to fix is:
    # <a href="#" className="hover:text-brand transition-colors">Features</a>
    # <a href="#" className="hover:text-brand transition-colors">Privacy Policy</a>
    # <a href="#" className="hover:text-brand transition-colors">Terms of Service</a>

    if "index.html" in file:
        html = html.replace('<a href="#" className="hover:text-brand transition-colors">Features</a>', '<a href="#features" className="hover:text-brand transition-colors">Features</a>')
    else:
        html = html.replace('<a href="#" className="hover:text-brand transition-colors">Features</a>', '<a href="index.html#features" className="hover:text-brand transition-colors">Features</a>')
        html = html.replace('<a href="#features" className="hover:text-brand transition-colors">Features</a>', '<a href="index.html#features" className="hover:text-brand transition-colors">Features</a>') # just in case

    html = html.replace('<a href="#" className="hover:text-brand transition-colors">Privacy Policy</a>', '<a href="privacy.html" className="hover:text-brand transition-colors">Privacy Policy</a>')
    html = html.replace('<a href="#" className="hover:text-brand transition-colors">Terms of Service</a>', '<a href="terms.html" className="hover:text-brand transition-colors">Terms of Service</a>')
    
    # Check if FAQ is missing in footer. It seems there was no FAQ in the footer.
    # Let's add it right after Features if it's not there.
    if '>FAQ</a>' not in html:
        html = html.replace('className="hover:text-brand transition-colors">Features</a>', 'className="hover:text-brand transition-colors">Features</a>\n                <a href="faq.html" className="hover:text-brand transition-colors">FAQ</a>')

    with open(file, 'w') as f:
        f.write(html)

print("Footer links fixed in all HTML files.")
