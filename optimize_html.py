import os
import glob
import re

# Find all HTML files
html_files = glob.glob('**/*.html', recursive=True)

# Define patterns
img_pattern = re.compile(r'<img\s+([^>]+)>', re.IGNORECASE)
html_pattern = re.compile(r'<html([^>]*)>', re.IGNORECASE)

def add_lazy_loading(match):
    attrs = match.group(1)
    if 'loading=' not in attrs.lower():
        return f'<img {attrs.strip()} loading="lazy" decoding="async">'
    return match.group(0)

def ensure_lang(match):
    attrs = match.group(1)
    if 'lang=' not in attrs.lower():
        return f'<html lang="en" {attrs.strip()}>'
    return match.group(0)

for file_path in html_files:
    if "node_modules" in file_path or ".git" in file_path:
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
        
    # Add loading="lazy" to imgs
    content = img_pattern.sub(add_lazy_loading, content)
    
    # Ensure <html lang="en">
    content = html_pattern.sub(ensure_lang, content)
    
    # Add og: meta tags if missing, mostly for UNI YEAR files
    if '<head>' in content:
        # Check if already has og:title
        if 'og:title' not in content:
            # Extract title
            title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
            title = title_match.group(1) if title_match else 'Zinco Studio'
            
            # Extract description
            desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', content, re.IGNORECASE)
            desc = desc_match.group(1) if desc_match else title
            
            og_tags = f"""
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:image" content="https://zjncoo.github.io/zinco/imghome/logo_zinco.svg" />
  <meta name="twitter:card" content="summary_large_image" />"""
            
            content = content.replace('<head>', '<head>' + og_tags)
            
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {file_path}")

print("Done.")
