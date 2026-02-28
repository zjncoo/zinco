import os
import re

base_dir = "/Volumes/Install macOS Sequoia/zinco"

targets = [
    '3M_Soluzioni_Immobiliari/3m.html',
    'ALGORYTHMS/algorythms.html',
    'NUS/nus.html',
    'ROXY/roxy.html',
    'about/about.html',
    'amdecor/amdecor.html',
    'beer/beer.html',
    'contact.html',
    'dranks/dranks.html',
    'escapes/escapes.html',
    'gizeta/gizeta.html',
    'ibiza/ibiza.html',
    'portfolio.html',
    'publications/publications.html',
    'publications/zoom/zoom.html'
]

# Read the new footer from index.html
with open(os.path.join(base_dir, 'index.html'), 'r', encoding='utf-8') as f:
    index_content = f.read()

# Extract from </div><!-- /site-main-content --> to </footer>
m = re.search(r'</div><!-- /site-main-content -->\s*<footer class="reveal-footer">.*?</form>\s*</div>\s*</div>.*?</footer>', index_content, re.DOTALL)
if not m:
    print("Could not find new footer in index.html")
    exit(1)

new_footer_template = m.group(0)

# Links and image sources to adjust:
# href="cookie-policy.html"
# href="privacy-policy.html"
# src="imghome/razzino.png"
# src="NUS/img/logo_nus.svg"
# src="escapes/img/logo_escapes.svg"

def adjust_paths(html_chunk, depth):
    if depth == 0:
        return html_chunk
    prefix = "../" * depth
    
    # Simple regex replaces for the known paths in the footer
    chunk = html_chunk.replace('href="cookie-policy.html"', f'href="{prefix}cookie-policy.html"')
    chunk = chunk.replace('href="privacy-policy.html"', f'href="{prefix}privacy-policy.html"')
    chunk = chunk.replace('src="imghome/razzino.png"', f'src="{prefix}imghome/razzino.png"')
    chunk = chunk.replace('src="NUS/img/logo_nus.svg"', f'src="{prefix}NUS/img/logo_nus.svg"')
    chunk = chunk.replace('src="escapes/img/logo_escapes.svg"', f'src="{prefix}escapes/img/logo_escapes.svg"')
    # If the depth is deeper, e.g. publications/zoom/zoom.html depth=2
    return chunk

for target in targets:
    path = os.path.join(base_dir, target)
    if not os.path.exists(path):
        print(f"Skipping {target}, does not exist")
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine depth
    depth = target.count('/')
    
    # Strip existing site-main-content wrap if any just to be clean, or just check
    if 'class="site-main-content"' in content:
        print(f"{target} already has site-main-content, skipping or needs manual.")
        continue
        
    # Replace body open
    body_pattern = r'(<body.*?>)'
    content = re.sub(body_pattern, r'\1\n  <div class="site-main-content">', content, count=1)
    
    # Replace old footer
    # Find <footer>...</footer>
    old_footer_pattern = r'<footer\b[^>]*>.*?</footer>'
    
    # Adjust paths for depth
    prefix = "../" * depth
    adjusted_footer = new_footer_template.replace('href="cookie-policy.html"', f'href="{prefix}cookie-policy.html"')
    adjusted_footer = adjusted_footer.replace('href="privacy-policy.html"', f'href="{prefix}privacy-policy.html"')
    adjusted_footer = adjusted_footer.replace('src="imghome/razzino.png"', f'src="{prefix}imghome/razzino.png"')
    adjusted_footer = adjusted_footer.replace('src="NUS/img/logo_nus.svg"', f'src="{prefix}NUS/img/logo_nus.svg"')
    adjusted_footer = adjusted_footer.replace('src="escapes/img/logo_escapes.svg"', f'src="{prefix}escapes/img/logo_escapes.svg"')
    
    # Close the site-main-content div before the footer
    replacement = f'</div><!-- /site-main-content -->\n\n  {adjusted_footer}'
    
    content = re.sub(old_footer_pattern, replacement, content, flags=re.DOTALL)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {target}")

print("Done.")
