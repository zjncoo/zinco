import os
import glob
import re

base_dir = "/Volumes/Install macOS Sequoia/zinco"

def patch_file(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # Simple regex replacing Helvetica Neue references
    
    # 1. First, replace known heading/menu selectors with changa
    # This regex catches: "h2 {" or ".class h2 {" followed by stuff then font-family: Helvetica
    content = re.sub(
        r'(.*?(h[1-6]|menu-link|--font-heading).*?\{[^}]*?)font-family:\s*\'Helvetica Neue\',\s*Helvetica,\s*Arial,\s*sans-serif;',
        r"\1font-family: 'changa', sans-serif; font-weight: 200;",
        content,
        flags=re.IGNORECASE | re.DOTALL
    )
    
    # 2. Then, replace any remaining Helvetica Neue with Inter
    content = re.sub(
        r'font-family:\s*\'Helvetica Neue\',\s*Helvetica,\s*Arial,\s*sans-serif;',
        r"font-family: 'Inter', sans-serif;",
        content,
        flags=re.IGNORECASE
    )
    
    # Minor cleanup for SVG Helvetica
    content = content.replace("font-family: HelveticaNeue-Bold, 'Helvetica Neue';", "font-family: 'changa', sans-serif;")
    
    if orig != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {fpath}")

for ext in ('**/*.css', '**/*.html', '**/*.js', '**/*.svg'):
    for file in glob.glob(os.path.join(base_dir, ext), recursive=True):
        patch_file(file)

print("Done")
