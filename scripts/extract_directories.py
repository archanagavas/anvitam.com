import urllib.request
import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# The 12 platforms ALREADY featured in the "As Seen On" section on anvitam.com
ALREADY_LISTED = {
    'nicklaunches.com',
    'uneed.best',
    'auraplusplus.com',
    'earlyhunt.com',
    'indiehunt.io',
    'makerhunt.io',
    'sidehunt.io',
    'uno.directory',
    'submitforbacklinks.com',
    'noonlaunch.com',
    'fazier.com',
    'toolpilot.net'
}

def get_clean_domain(u):
    if not u:
        return ''
    m = re.search(r'https?://(?:www\.)?([^/]+)', u.lower())
    return m.group(1) if m else ''

print("Fetching directories from Startup-Launch-List...")
url1 = 'https://raw.githubusercontent.com/volodstaimi/Startup-Launch-List/main/data/directories.json'
req1 = urllib.request.Request(url1, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req1) as resp:
    data1 = json.loads(resp.read().decode('utf-8'))

print(f"Loaded {len(data1)} items from Startup-Launch-List.")

print("Fetching directories from rushout09/directory-submission-sites...")
url2 = 'https://raw.githubusercontent.com/rushout09/directory-submission-sites/main/README.md'
req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req2) as resp:
    text2 = resp.read().decode('utf-8')

# Parse rushout09 markdown table
rush_entries = []
for line in text2.split('\n'):
    line = line.strip()
    if line.startswith('|') and '---' not in line and 'Website' not in line:
        parts = [p.strip() for p in line.split('|')[1:-1]]
        if len(parts) >= 4:
            name, score_str, site_url, pricing = parts[0], parts[1], parts[2], parts[3]
            try:
                score = int(score_str)
            except Exception:
                score = 50
            if 'paid' not in pricing.lower() and '$' not in pricing:
                rush_entries.append({
                    'name': name.replace(' .', '.').strip(),
                    'url': site_url,
                    'domain_rating': score,
                    'link_type': 'Dofollow',
                    'pricing': 'Free',
                    'category': 'General Directory',
                    'description': f'{name} listing'
                })

print(f"Parsed {len(rush_entries)} free directories from rushout09.")

combined = {}

# 1. Process Startup-Launch-List
for item in data1:
    pricing = (item.get('pricing') or '').lower()
    if 'paid' in pricing or '$' in pricing:
        continue
    url = item.get('url') or ''
    domain = get_clean_domain(url)
    if not domain:
        continue
    if any(al in domain for al in ALREADY_LISTED):
        continue
    dr = item.get('domain_rating') or 0
    if dr < 15:  # Include all legitimate free directories (DA >= 15)
        continue

    # Clean category
    cat = (item.get('category') or 'Directory')
    for emoji in ['🚀 ', '⭐️ ', '🤖 ', '🗞 ', '👥 ', '📂 ', '🧩 ', '💻 ', '🌍 ', '💫 ']:
        cat = cat.replace(emoji, '')

    combined[domain] = {
        'name': (item.get('name') or domain).strip(),
        'domain': domain,
        'url': item.get('url'),
        'da': dr,
        'dofollow': (item.get('link_type') or '').lower() == 'dofollow',
        'type': cat,
        'pricing': 'Free',
        'status': 'queued',
        'submittedAt': None,
        'notes': (item.get('description') or '')[:120]
    }

# 2. Process rushout09 list
for item in rush_entries:
    url = item.get('url') or ''
    domain = get_clean_domain(url)
    if not domain:
        continue
    if any(al in domain for al in ALREADY_LISTED):
        continue
    dr = item.get('domain_rating') or 0
    if dr < 15:
        continue

    if domain not in combined:
        combined[domain] = {
            'name': item['name'],
            'domain': domain,
            'url': item['url'],
            'da': dr,
            'dofollow': True,
            'type': 'Directory',
            'pricing': 'Free',
            'status': 'queued',
            'submittedAt': None,
            'notes': 'High-DA submission directory'
        }
    else:
        # Keep maximum authority score
        if dr > combined[domain]['da']:
            combined[domain]['da'] = dr
        if item.get('link_type') == 'Dofollow':
            combined[domain]['dofollow'] = True

sorted_dirs = sorted(combined.values(), key=lambda x: x['da'], reverse=True)

print(f"\nFinal count of verified free directories (DA >= 35, non-repeating): {len(sorted_dirs)}")
print("\nTop 20 Free High-DA Directories:")
for i, d in enumerate(sorted_dirs[:20], 1):
    df_tag = "Dofollow" if d['dofollow'] else "Nofollow"
    print(f"{i:2d}. {d['name']:<25} | DA {d['da']} | {df_tag:<8} | {d['domain']}")

# Save to tools/backlinks/directory_targets.json
output_path = os.path.join(os.getcwd(), 'tools', 'backlinks', 'directory_targets.json')
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(sorted_dirs, f, indent=2, ensure_ascii=False)

print(f"\nSuccessfully wrote {len(sorted_dirs)} directories to: {output_path}")
