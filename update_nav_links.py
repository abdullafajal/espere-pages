import glob
import os

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    filename = os.path.basename(file)
    with open(file, 'r') as f:
        html = f.read()

    # Extract the block between `<div className="hidden md:flex` and `</div>`
    start_str = '<div className="hidden md:flex items-center gap-8 text-[15px] font-bold text-dark/60">'
    end_str = '            </div>\n            \n            <div>\n              <a href="espere.apk"'
    
    if start_str in html and end_str in html:
        before = html.split(start_str)[0]
        after = html.split(end_str)[1]
        
        # Build the new nav block
        links = [
            {'name': 'Features', 'href': '/#features', 'file': 'index.html'},
            {'name': 'FAQ', 'href': 'faq.html', 'file': 'faq.html'},
            {'name': 'Privacy Policy', 'href': 'privacy.html', 'file': 'privacy.html'},
            {'name': 'Terms of Service', 'href': 'terms.html', 'file': 'terms.html'},
            {'name': 'Contact Support', 'href': 'contact.html', 'file': 'contact.html'},
        ]
        
        # Build the HTML for the links
        nav_html = f'{start_str}\n'
        for link in links:
            if filename == link['file']:
                # Active state
                nav_html += f'              <a href="{link["href"]}" className="text-dark border-b-2 border-dark pb-1 hover:text-dark transition-colors">{link["name"]}</a>\n'
            else:
                # Inactive state
                nav_html += f'              <a href="{link["href"]}" className="hover:text-dark transition-colors">{link["name"]}</a>\n'
        
        nav_html += '            </div>\n            \n            <div>\n              <a href="espere.apk"'
        
        # Because we changed gap-8 to gap-6 maybe? Let's keep gap-6 to fit it all.
        nav_html = nav_html.replace('gap-8', 'gap-6')
        
        new_html = before + nav_html + after
        
        with open(file, 'w') as f:
            f.write(new_html)

print("Nav links updated.")
