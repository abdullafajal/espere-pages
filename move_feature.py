import re

with open('/Users/aqib/work/expence_tracker/espere-pages/index.html', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
insert_idx = -1

for i, line in enumerate(lines):
    if "Feature 1: Intelligent Group Settlements" in line:
        start_idx = i
    if "Feature 2: Intuitive Swipe Actions" in line:
        end_idx = i
    if "Feature 6: Offline PWA" in line:
        # We need to find the end of this block, or we can just look for the end of the grid
        pass
    if "</div>" in line and "</div>" in lines[i+1] and "</section>" in lines[i+2] and "const CTA = () =>" in "".join(lines[i:i+10]):
        insert_idx = i - 1

if start_idx != -1 and end_idx != -1 and insert_idx != -1:
    feature_1_lines = lines[start_idx:end_idx]
    # Remove from original position
    del lines[start_idx:end_idx]
    
    # Recalculate insert_idx since we deleted lines before it
    new_insert_idx = insert_idx - (end_idx - start_idx)
    
    # Insert at new position
    lines = lines[:new_insert_idx] + ["\n"] + feature_1_lines + lines[new_insert_idx:]
    
    with open('/Users/aqib/work/expence_tracker/espere-pages/index.html', 'w') as f:
        f.writelines(lines)
    print("Successfully moved Feature 1 to the bottom!")
else:
    print(f"Failed to find indices. start: {start_idx}, end: {end_idx}, insert: {insert_idx}")
