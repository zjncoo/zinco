import os
import re

base_dir = "/Volumes/Install macOS Sequoia/zinco"

def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace any href that ends with contact.html or contacts.html (and any ../ prefix)
    # Examples: href="contact.html", href="../contact.html", href="../../contacts.html"
    
    # Simple regex to catch these: href="(\.\./)*contact(s)?\.html" -> href="#contact-footer"
    pattern = r'href="\s*(?:\.\./)*contacts?\.html\s*"'
    
    new_content, count = re.subn(pattern, 'href="#contact-footer"', content)
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Replaced {count} instances in {os.path.relpath(filepath, base_dir)}")

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".html"):
            process_html_file(os.path.join(root, file))

print("Link replacement complete.")
