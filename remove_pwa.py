import glob
import re

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    with open(file, 'r') as f:
        html = f.read()

    # Remove manifest link
    html = re.sub(r'<link rel="manifest".*?>\s*', '', html)

    # Remove PWA meta tags
    html = re.sub(r'<!-- PWA Meta Tags -->\s*<meta name="theme-color".*?>\s*<meta name="mobile-web-app-capable".*?>\s*<meta name="apple-mobile-web-app-capable".*?>\s*<meta name="apple-mobile-web-app-status-bar-style".*?>\s*<meta name="apple-mobile-web-app-title".*?>\s*', '', html)

    # Remove Service Worker registration
    sw_script_pattern = r'<script>\s*// Register Service Worker\s*if \(\'serviceWorker\' in navigator\) \{.*?</script>\s*'
    html = re.sub(sw_script_pattern, '', html, flags=re.DOTALL)

    with open(file, 'w') as f:
        f.write(html)

print("PWA removed from all HTML files.")
