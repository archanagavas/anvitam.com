# AI Search Optimization Guide

This guide details the setup and configuration to ensure the website is fully optimized for AI Search Engines (AEO - Answer Engine Optimization).

---

## 1. The llms.txt File (The "Map")
This file acts as a clean, HTML-free index for AI models, telling them exactly what the site contains without requiring parsing of complex DOM elements.
* **Location:** `/llms.txt` (Root directory, automatically generated at build time)
* **Format:** Markdown (conforming to the [llmstxt.org](https://llmstxt.org) spec)

---

## 2. The robots.txt File (The "Gates")
Our `robots.txt` configuration is open to the specific User Agents used by major AI search engines and LLM models.

```txt
# Allow Google's AI & Search (Gemini/Search)
User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /api/

# Allow Google's Training (needed for long-term Gemini knowledge)
User-agent: Google-Extended
Allow: /
Disallow: /admin
Disallow: /api/

# Allow OpenAI Search (ChatGPT Search)
User-agent: OAI-SearchBot
Allow: /
Disallow: /admin
Disallow: /api/

# Allow OpenAI Training (helps ChatGPT "know" you long-term)
User-agent: GPTBot
Allow: /
Disallow: /admin
Disallow: /api/

# Allow Anthropic (Claude)
User-agent: ClaudeBot
Allow: /
Disallow: /admin
Disallow: /api/

# Allow Perplexity AI
User-agent: PerplexityBot
Allow: /
Disallow: /admin
Disallow: /api/

# General Fallback
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
```

---

## 3. Python Audit Tool (The "Check")
Run this script in your local environment to verify your site is visible to AI search bots.

```python
import requests
from urllib.parse import urljoin, urlparse

def check_ai_visibility(url):
    print(f"🔍 Auditing: {url}\n" + "="*40)
    
    # 1. Check Robots.txt
    domain = urlparse(url).netloc
    robots_url = f"{urlparse(url).scheme}://{domain}/robots.txt"
    
    try:
        r = requests.get(robots_url, timeout=5)
        if r.status_code == 200:
            print(f"✅ robots.txt found at {robots_url}")
            rules = r.text.lower()
            
            # Critical AI Bots to Check
            ai_bots = [
                "gptbot", "oai-searchbot", # OpenAI
                "claudebot",               # Anthropic
                "perplexitybot",           # Perplexity
                "google-extended"          # Gemini Training
            ]
            
            print("\n🤖 Bot Permission Check (Simple Text Scan):")
            for bot in ai_bots:
                if f"disallow: /" in rules and f"user-agent: {bot}" in rules:
                    print(f"   ⚠️  WARNING: Potential block detected for {bot}")
                elif bot in rules:
                    print(f"   ℹ️  {bot} is explicitly mentioned.")
                else:
                    print(f"   ⚪ {bot} not explicitly mentioned (inherits '*' rules).")
        else:
            print(f"❌ robots.txt not found (Status: {r.status_code})")
    except Exception as e:
        print(f"❌ Error fetching robots.txt: {e}")

    # 2. Check Content Visibility (HTML vs JS)
    print("\n📄 Content Visibility Check:")
    try:
        # Simulate a "dumb" crawler (no JS)
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://google.com)'}
        page_response = requests.get(url, headers=headers, timeout=10)
        page_content = page_response.text.lower()
        
        test_phrase = input("\nType a unique phrase from your content to test visibility: ").lower()
        
        if test_phrase in page_content:
            print(f"✅ SUCCESS: '{test_phrase}' is visible in raw HTML.")
        else:
            print(f"⚠️  WARNING: '{test_phrase}' NOT found in raw HTML.")
            print("   -> This content might be locked behind JavaScript or user interactions (accordions/tabs).")
            print("   -> AI bots without full rendering capabilities (like basic scrapers) will miss this.")
            
    except Exception as e:
        print(f"❌ Error fetching page: {e}")

if __name__ == "__main__":
    target_url = input("Enter your website URL (e.g., https://example.com): ")
    check_ai_visibility(target_url)
```

---

## 4. "Hidden Content" Checklist
Ensure the following best practices are met so AI search crawlers can parse and index the content efficiently:
* **Accordions/Tabs:** Verify that the text inside tabs/accordions is pre-rendered in the static HTML source, not loaded exclusively via dynamic client-side JS clicks.
* **Pagination:** Do not rely solely on infinite scroll. Provide clear `<a href="/page/2">` links for indexation.
* **Images:** Provide comprehensive `alt` text for images and architectural designs.
* **Prerendering / Server-Side Rendering:** Verify that the root HTML includes basic semantic content to support crawlers that do not run JavaScript.
