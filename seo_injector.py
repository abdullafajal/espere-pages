import os
import glob
import re

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    with open(file, 'r') as f:
        html = f.read()
    
    filename = os.path.basename(file)
    
    if filename == 'index.html':
        title = "Espere - Track Personal Expenses & Split Group Bills Instantly"
        url = "https://espere.in/"
    else:
        title_match = html.split('<title>')[1].split('</title>')[0] if '<title>' in html else 'Espere'
        # ensure it's not overriding the index title
        title = title_match
        url = f"https://espere.in/{filename}"

    description = "Master your money with Espere. The ultimate app to track personal spending with precision, set smart budgets, and instantly split group expenses with friends."
    keywords = "expense tracker, split bills, group expenses, budget planner, personal finance app, money manager, settle debts, splitwise alternative"
    
    start_tag = '<meta charset="UTF-8">'
    end_tag = '<!-- PWA Meta Tags -->'
    
    if start_tag in html and end_tag in html:
        before = html.split(start_tag)[0]
        after = html.split(end_tag)[1]
        
        seo_block = f"""{start_tag}
  <title>{title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="{description}">
  <meta name="keywords" content="{keywords}">
  <meta name="author" content="Espere">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="https://espere.in/images/logo.png">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="{url}">
  <meta property="twitter:title" content="{title}">
  <meta property="twitter:description" content="{description}">
  <meta property="twitter:image" content="https://espere.in/images/logo.png">
  
  <link rel="canonical" href="{url}">

  {end_tag}"""
        
        html = before + seo_block + after
        
        with open(file, 'w') as f:
            f.write(html)

print("SEO Tags Injected.")
