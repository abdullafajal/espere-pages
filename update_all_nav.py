import glob
import os

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    filename = os.path.basename(file)
    with open(file, 'r') as f:
        html = f.read()

    # Update Nav Links
    start_str = '<div className="hidden md:flex items-center gap-6 text-[15px] font-bold text-dark/60">'
    end_str = '            </div>\n            \n            <div>\n              <a href="espere.apk"'
    
    if start_str in html and end_str in html:
        before = html.split(start_str)[0]
        after = html.split(end_str)[1]
        
        links = [
            {'name': 'Features', 'href': '/#features', 'file': 'index.html'},
            {'name': 'About', 'href': 'about.html', 'file': 'about.html'},
            {'name': 'FAQ', 'href': 'faq.html', 'file': 'faq.html'},
            {'name': 'Privacy Policy', 'href': 'privacy.html', 'file': 'privacy.html'},
            {'name': 'Terms of Service', 'href': 'terms.html', 'file': 'terms.html'},
            {'name': 'Contact Support', 'href': 'contact.html', 'file': 'contact.html'},
        ]
        
        nav_html = f'{start_str}\n'
        for link in links:
            if filename == link['file']:
                nav_html += f'              <a href="{link["href"]}" className="text-dark border-b-2 border-dark pb-1 hover:text-dark transition-colors">{link["name"]}</a>\n'
            else:
                nav_html += f'              <a href="{link["href"]}" className="hover:text-dark transition-colors">{link["name"]}</a>\n'
        
        nav_html += '            </div>\n            \n            <div>\n              <a href="espere.apk"'
        
        html = before + nav_html + after

    # Update Footer Links
    footer_start = '<div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-dark/70">'
    footer_end = '              </div>\n              \n              <div className="flex gap-5">'
    
    if footer_start in html and footer_end in html:
        f_before = html.split(footer_start)[0]
        f_after = html.split(footer_end)[1]
        
        f_links = [
            {'name': 'Features', 'href': '/#features'},
            {'name': 'About', 'href': 'about.html'},
            {'name': 'Privacy Policy', 'href': 'privacy.html'},
            {'name': 'Terms of Service', 'href': 'terms.html'},
            {'name': 'Contact Support', 'href': 'contact.html'},
        ]
        
        f_html = f'{footer_start}\n'
        for link in f_links:
            f_html += f'                <a href="{link["href"]}" className="hover:text-brand transition-colors">{link["name"]}</a>\n'
        
        f_html += '              </div>\n              \n              <div className="flex gap-5">'
        html = f_before + f_html + f_after

    with open(file, 'w') as f:
        f.write(html)

print("Updated nav and footer links in all files.")
