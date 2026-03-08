import os
import glob

base_dir = "/Volumes/Install macOS Sequoia/zinco"

html_files = glob.glob(os.path.join(base_dir, "**/*.html"), recursive=True)

link_tag = '<link rel="stylesheet" href="https://use.typekit.net/rra4uka.css">'

count = 0
for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if link_tag in content:
        continue
        
    # Insert before </head>
    if '</head>' in content:
        new_content = content.replace('</head>', f'  {link_tag}\n</head>')
        
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        print(f"Added link to {html_file}")

print(f"Total files updated: {count}")
