import glob
import re

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    with open(file, 'r') as f:
        html = f.read()
    
    # Simple regex to find icon containers
    # e.g. <div className="... bg-... "> <i className="... text-... ">
    
    matches = re.findall(r'(<div[^>]*class(?:Name)?="[^"]*bg-[^"]*"[^>]*>\s*<i[^>]*class(?:Name)?="[^"]*ph-[^"]*"[^>]*>.*?</div>)', html, re.DOTALL)
    if matches:
        print(f"--- {file} ---")
        for m in matches:
            print(m)
            print()
