"""
1-Click Automated Google Business Profile OAuth Setup.
Runs a local callback server, opens the browser, captures the authorization code,
exchanges it for a permanent Refresh Token, detects Account ID & Location ID,
and writes them directly into .env.local without manual copying!
"""

import os
import sys
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import requests
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv(".env.autopilot")

CLIENT_ID = os.getenv("GOOGLE_BUSINESS_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_BUSINESS_CLIENT_SECRET")
SCOPE = "https://www.googleapis.com/auth/business.manage"
PORT = 8088
REDIRECT_URI = f"http://127.0.0.1:{PORT}"

captured_code = None

class OAuthCallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global captured_code
        query_components = parse_qs(urlparse(self.path).query)
        if "code" in query_components:
            captured_code = query_components["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"""
            <html><body style="font-family: Arial; text-align: center; padding: 50px; background-color: #f0fdf4;">
            <h1 style="color: #166534;">&#10004; Authentication Successful!</h1>
            <p>Anvitam Autopilot has received your Google Business authorization.</p>
            <p>You can close this window now and return to your terminal.</p>
            </body></html>
            """)
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Failed to capture authorization code.")

    def log_message(self, format, *args):
        pass

def run_auth():
    print("\n" + "=" * 65)
    print("🌿 ANVITAM GOOGLE BUSINESS PROFILE 1-CLICK OAUTH")
    print("=" * 65)

    if not CLIENT_ID or not CLIENT_SECRET:
        print("❌ Error: Missing GOOGLE_BUSINESS_CLIENT_ID or GOOGLE_BUSINESS_CLIENT_SECRET in .env.local")
        return

    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={CLIENT_ID}&"
        f"redirect_uri={REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={SCOPE}&"
        f"access_type=offline&"
        f"prompt=consent"
    )

    print("\nOpening your browser for Google authorization...")
    print("If browser does not open automatically, visit this URL:")
    print(auth_url)
    print("\nWaiting for authorization on http://127.0.0.1:8088 ...")

    server = HTTPServer(("127.0.0.1", PORT), OAuthCallbackHandler)
    try:
        webbrowser.open(auth_url)
    except Exception:
        pass

    # Handle one request
    server.handle_request()
    server.server_close()

    if not captured_code:
        print("❌ Did not receive authorization code.")
        return

    print("\n✔ Authorization code received! Exchanging for permanent Refresh Token...")
    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": captured_code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI
    }

    res = requests.post(token_url, data=payload, timeout=20)
    if res.status_code != 200:
        print(f"❌ Failed to obtain token ({res.status_code}): {res.text}")
        return

    tokens = res.json()
    refresh_token = tokens.get("refresh_token")
    access_token = tokens.get("access_token")

    if not refresh_token:
        print("⚠ Note: Google did not return a new refresh token (already authorized).")
        print("Tokens received:", tokens.keys())

    print("✔ Successfully obtained permanent Refresh Token!")

    # Discover Accounts & Locations
    headers = {"Authorization": f"Bearer {access_token}"}
    acct_url = "https://mybusinessaccountmanagement.googleapis.com/v1/accounts"
    res_acct = requests.get(acct_url, headers=headers, timeout=20)

    account_id = None
    location_id = None

    if res_acct.status_code == 200:
        accounts = res_acct.json().get("accounts", [])
        if accounts:
            account_name = accounts[0].get("name")
            account_id = account_name.split("/")[-1] if account_name else None
            print(f"✔ Detected Account ID: {account_id}")

            loc_url = f"https://mybusinessbusinessinformation.googleapis.com/v1/{account_name}/locations?readMask=name,title"
            res_loc = requests.get(loc_url, headers=headers, timeout=20)
            if res_loc.status_code == 200:
                locations = res_loc.json().get("locations", [])
                if locations:
                    loc_name = locations[0].get("name")
                    location_id = loc_name.split("/")[-1] if loc_name else None
                    print(f"✔ Detected Location: '{locations[0].get('title')}' (ID: {location_id})")

    # Update .env.local automatically
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            content = f.read()

        if refresh_token:
            if 'GOOGLE_BUSINESS_REFRESH_TOKEN=""' in content:
                content = content.replace('GOOGLE_BUSINESS_REFRESH_TOKEN=""', f'GOOGLE_BUSINESS_REFRESH_TOKEN="{refresh_token}"')
            elif "GOOGLE_BUSINESS_REFRESH_TOKEN=" not in content:
                content += f'\nGOOGLE_BUSINESS_REFRESH_TOKEN="{refresh_token}"'

        if account_id:
            if 'GOOGLE_BUSINESS_ACCOUNT_ID=""' in content:
                content = content.replace('GOOGLE_BUSINESS_ACCOUNT_ID=""', f'GOOGLE_BUSINESS_ACCOUNT_ID="{account_id}"')
            elif "GOOGLE_BUSINESS_ACCOUNT_ID=" not in content:
                content += f'\nGOOGLE_BUSINESS_ACCOUNT_ID="{account_id}"'

        if location_id:
            if 'GOOGLE_BUSINESS_LOCATION_ID=""' in content:
                content = content.replace('GOOGLE_BUSINESS_LOCATION_ID=""', f'GOOGLE_BUSINESS_LOCATION_ID="{location_id}"')
            elif "GOOGLE_BUSINESS_LOCATION_ID=" not in content:
                content += f'\nGOOGLE_BUSINESS_LOCATION_ID="{location_id}"'

        with open(env_path, "w", encoding="utf-8") as f:
            f.write(content)

        print("\n✔ Automatically updated .env.local with your Google Business tokens!")
    print("=" * 65 + "\n")

if __name__ == "__main__":
    run_auth()
